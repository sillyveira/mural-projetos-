import { getDatabase } from '@/lib/mongodb';
import { Collection, ObjectId } from 'mongodb';

export type ProjectStatus = 'FINALIZADO' | 'EM DESENVOLVIMENTO';

export interface Project {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  author: string;
  githubUrl: string;
  status: ProjectStatus;
  imageUrl: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Obtém a coleção de projetos do MongoDB
 */
async function getProjectsCollection(): Promise<Collection<Project>> {
  const db = await getDatabase();
  return db.collection<Project>('projects');
}

/**
 * Lista todos os projetos
 */
export async function listProjects(): Promise<Project[]> {
  const collection = await getProjectsCollection();
  const projects = await collection.find({}).toArray();
  
  // Converte _id do MongoDB para string no campo id
  return projects.map(project => ({
    ...project,
    id: project._id?.toString(),
  }));
}

/**
 * Busca um projeto pelo ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const collection = await getProjectsCollection();
  const project = await collection.findOne({ _id: new ObjectId(id) });
  
  if (!project) return null;
  
  return {
    ...project,
    id: project._id?.toString(),
  };
}

/**
 * Cria um novo projeto
 */
export async function createProject(data: Omit<Project, '_id' | 'id' | 'createdAt'>): Promise<Project> {
  const collection = await getProjectsCollection();
  
  const newProject: Omit<Project, '_id' | 'id'> = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  
  const result = await collection.insertOne(newProject as Project);
  
  return {
    ...newProject,
    id: result.insertedId.toString(),
    _id: result.insertedId,
  };
}

/**
 * Atualiza um projeto existente
 */
export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const collection = await getProjectsCollection();
  
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  // Remove campos que não devem ser atualizados
  delete updateData._id;
  delete updateData.id;
  delete (updateData as any).createdAt;
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  if (!result) return null;
  
  return {
    ...result,
    id: result._id?.toString(),
  };
}

/**
 * Deleta um projeto
 */
export async function deleteProject(id: string): Promise<boolean> {
  const collection = await getProjectsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
  return result.deletedCount > 0;
}

/**
 * Busca projetos com filtros
 */
export async function searchProjects(query: {
  author?: string;
  title?: string;
  status?: ProjectStatus;
  limit?: number;
  skip?: number;
}): Promise<Project[]> {
  const collection = await getProjectsCollection();
  
  const filter: any = {};
  
  if (query.author) {
    filter.author = { $regex: query.author, $options: 'i' };
  }
  
  if (query.title) {
    filter.title = { $regex: query.title, $options: 'i' };
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  const projects = await collection
    .find(filter)
    .limit(query.limit || 50)
    .skip(query.skip || 0)
    .sort({ createdAt: -1 })
    .toArray();
  
  return projects.map(project => ({
    ...project,
    id: project._id?.toString(),
  }));
}
