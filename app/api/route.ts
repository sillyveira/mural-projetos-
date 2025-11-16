import { NextResponse } from 'next/server';
import { 
  listProjects, 
  createProject, 
  deleteProject,
  searchProjects,
  type ProjectStatus 
} from '@/lib/projects';

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
 * Body esperado:
 * {
 *   "title": "string",
 *   "description": "string",
 *   "author": "string",
 *   "githubUrl": "string",
 *   "status": "FINALIZADO" | "EM DESENVOLVIMENTO",
 *   "imageUrl": "string"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação de campos obrigatórios
    const requiredFields = ['title', 'description', 'author', 'githubUrl', 'status', 'imageUrl'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios faltando',
          required: requiredFields,
          missing: missingFields
        },
        { status: 400 }
      );
    }
    
    // Validação do campo status
    if (body.status !== 'FINALIZADO' && body.status !== 'EM DESENVOLVIMENTO') {
      return NextResponse.json(
        {
          success: false,
          error: 'Status inválido',
          message: 'O status deve ser "FINALIZADO" ou "EM DESENVOLVIMENTO"'
        },
        { status: 400 }
      );
    }
    
    // Validação básica de URL
    try {
      new URL(body.githubUrl);
      new URL(body.imageUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'URL inválida',
          message: 'githubUrl e imageUrl devem ser URLs válidas'
        },
        { status: 400 }
      );
    }
    
    // Criar projeto no MongoDB
    const newProject = await createProject({
      title: body.title,
      description: body.description,
      author: body.author,
      githubUrl: body.githubUrl,
      status: body.status,
      imageUrl: body.imageUrl,
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
