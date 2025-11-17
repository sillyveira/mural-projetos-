'use client'

import Header from './components/Header';
import { ProjectCarousel } from './components/ProjectCarousel';
import { Project } from './components/ProjectCard';


export default function Home() {
  // Lista de projetos de exemplo
  const projects: Project[] = [
    {
      id: "1",
      author: "Wesley, Amanda e Josias",
      title: "Mural de Projetos",
      description: "Um projeto para dispor um mural digital dos projetos submetidos por alunos.",
      githubUrl: "https://github.com/seal-ufpe/mural-projetos",
      status: "live",
      imageUrl: "https://b2midia.com.br/wp-content/uploads/2024/08/03-feature-multizonas.jpg"
    },
    {
      id: "2",
      author: "Equipe SEAL",
      title: "Sistema de Gestão",
      description: "Sistema completo para gestão de projetos acadêmicos com foco em engenharia de software.",
      githubUrl: "https://github.com/seal-ufpe/sistema-gestao",
      status: "development",
      imageUrl: "https://b2midia.com.br/wp-content/uploads/2024/08/03-feature-multizonas.jpg"
    },
    {
      id: "3",
      author: "João Silva",
      title: "Projeto em Destaque",
      description: "Um projeto inovador que está transformando a forma como desenvolvemos software.",
      githubUrl: "https://github.com/seal-ufpe/projeto-destaque",
      status: "featured",
      imageUrl: "https://b2midia.com.br/wp-content/uploads/2024/08/03-feature-multizonas.jpg"
    },
    {
      id: "4",
      author: "Maria Santos",
      title: "App Mobile SEAL",
      description: "Aplicativo mobile para facilitar o acesso aos projetos e eventos da liga.",
      githubUrl: "https://github.com/seal-ufpe/app-mobile",
      status: "live",
      imageUrl: "https://b2midia.com.br/wp-content/uploads/2024/08/03-feature-multizonas.jpg"
    },
    {
      id: "5",
      author: "Pedro Costa",
      title: "Dashboard Analytics",
      description: "Dashboard interativo para análise de dados e métricas dos projetos.",
      githubUrl: "https://github.com/seal-ufpe/dashboard",
      status: "development",
      imageUrl: "https://b2midia.com.br/wp-content/uploads/2024/08/03-feature-multizonas.jpg"
    }
  ];

  return (
    <main className="bg-primary min-h-screen">
      <Header />

      <div className=''>
        <ProjectCarousel 
          projects={projects}
          visibleCount={4}
          autoPlayInterval={5000}
        />
      </div>

    </main>
  );
}
