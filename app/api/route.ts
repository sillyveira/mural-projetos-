import { NextResponse } from 'next/server';
import { 
  listProjects, 
  createProject, 
  deleteProject,
  searchProjects,
  type ProjectStatus 
} from '@/lib/projects';
import { uploadImage } from '@/lib/cloudinary';

/**
 * GET - Listar projetos
 * Query params suportados:
 * - author: filtrar por autor
 * - title: filtrar por título
 * - status: filtrar por status (FINALIZADO ou EM DESENVOLVIMENTO)
 * - limit: limite de resultados (padrão: 50)
 * - skip: pular N resultados (para paginação)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros de busca
    const author = searchParams.get('author');
    const title = searchParams.get('title');
    const status = searchParams.get('status') as ProjectStatus | null;
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    
    let projects;
    
    // Se houver filtros, usa searchProjects, senão lista todos
    if (author || title || status || limit || skip) {
      projects = await searchProjects({
        author: author || undefined,
        title: title || undefined,
        status: status || undefined,
        limit: limit ? parseInt(limit) : undefined,
        skip: skip ? parseInt(skip) : undefined,
      });
    } else {
      projects = await listProjects();
    }
    
    return NextResponse.json(
      { 
        success: true,
        data: projects,
        total: projects.length
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao listar projetos',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Adicionar novo projeto
 * Body esperado (FormData):
 * - title: string
 * - description: string
 * - author: string
 * - githubUrl: string
 * - status: "FINALIZADO" | "EM DESENVOLVIMENTO"
 * - image: File (arquivo da imagem)
 */
export async function POST(request: Request) {
  try {
    // Receber FormData ao invés de JSON
    const formData = await request.formData();
    
    // Extrair campos do FormData
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const author = formData.get('author') as string;
    const githubUrl = formData.get('githubUrl') as string;
    const status = formData.get('status') as ProjectStatus;
    const imageFile = formData.get('image') as File | null;
    
    // Validação de campos obrigatórios
    if (!title || !description || !author || !githubUrl || !status || !imageFile) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!description) missingFields.push('description');
      if (!author) missingFields.push('author');
      if (!githubUrl) missingFields.push('githubUrl');
      if (!status) missingFields.push('status');
      if (!imageFile) missingFields.push('image');
      
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios faltando',
          required: ['title', 'description', 'author', 'githubUrl', 'status', 'image'],
          missing: missingFields
        },
        { status: 400 }
      );
    }
    
    // Validação do campo status
    if (status !== 'FINALIZADO' && status !== 'EM DESENVOLVIMENTO') {
      return NextResponse.json(
        {
          success: false,
          error: 'Status inválido',
          message: 'O status deve ser "FINALIZADO" ou "EM DESENVOLVIMENTO"'
        },
        { status: 400 }
      );
    }
    
    // Validação básica de URL do GitHub
    try {
      new URL(githubUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'URL inválida',
          message: 'githubUrl deve ser uma URL válida'
        },
        { status: 400 }
      );
    }
    
    // Validação do tipo de arquivo
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de arquivo inválido',
          message: 'O arquivo deve ser uma imagem'
        },
        { status: 400 }
      );
    }
    
    // Validação do tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo muito grande',
          message: 'O arquivo deve ter no máximo 5MB'
        },
        { status: 400 }
      );
    }
    
    // Upload da imagem para o Cloudinary
    let imageUrl: string;
    try {
      imageUrl = await uploadImage(imageFile);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao fazer upload da imagem',
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { status: 500 }
      );
    }
    
    // Criar projeto no MongoDB com a URL do Cloudinary
    const newProject = await createProject({
      title,
      description,
      author,
      githubUrl,
      status,
      imageUrl,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: newProject,
        message: 'Projeto criado com sucesso'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar projeto',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Deletar projeto
 * Query params:
 * - id: ID do projeto a ser deletado (ObjectId do MongoDB)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do projeto não fornecido'
        },
        { status: 400 }
      );
    }
    
    // Validar formato do ObjectId (24 caracteres hexadecimais)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'O ID deve ser um ObjectId válido do MongoDB (24 caracteres hexadecimais)'
        },
        { status: 400 }
      );
    }
    
    // Deletar projeto do MongoDB
    const deleted = await deleteProject(id);
    
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projeto não encontrado'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Projeto deletado com sucesso'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao deletar projeto',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
