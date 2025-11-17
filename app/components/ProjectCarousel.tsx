"use client";

import { useState, useEffect } from 'react';
import { ProjectCard} from './ProjectCard';
import { type Project } from '@/lib/projects';
interface ProjectCarouselProps {
  projects: Project[];
  visibleCount?: number;
  autoPlayInterval?: number; // em milissegundos
}

export const ProjectCarousel = ({ 
  projects, 
  visibleCount = 3,
  autoPlayInterval = 5000 
}: ProjectCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto play - avança automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= projects.length ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [projects.length, autoPlayInterval]);

  // Função para obter os projetos visíveis
  const getVisibleProjects = () => {
    const visible: { project: Project; position: 'left' | 'center' | 'right' | 'side' }[] = [];
    const halfVisible = Math.floor(visibleCount / 2);

    for (let i = -halfVisible; i <= halfVisible; i++) {
      let index = currentIndex + i;
      
      // Garante que o índice seja circular
      if (index < 0) {
        index = projects.length + index;
      } else if (index >= projects.length) {
        index = index - projects.length;
      }

      // Verifica se o projeto existe no índice calculado
      const project = projects[index];
      if (!project) continue;

      let position: 'left' | 'center' | 'right' | 'side';
      
      if (i === 0) {
        position = 'center';
      } else if (i === -1) {
        position = 'left';
      } else if (i === 1) {
        position = 'right';
      } else {
        position = 'side';
      }

      visible.push({ project, position });
    }

    return visible;
  };

  // Função para obter as classes de tamanho baseado na posição
  const getCardClasses = (position: 'left' | 'center' | 'right' | 'side') => {
    const baseClasses = 'transition-all duration-1000 ease-in-out w-[500px] min-w-[500px] max-w-[500px] h-[600px] min-h-[600px] max-h-[600px]';
    
    switch (position) {
      case 'center':
        return `${baseClasses} z-20 opacity-100`;
      case 'left':
      case 'right':
        return `${baseClasses} z-10 opacity-80`;
      case 'side':
        return `${baseClasses} z-0 opacity-50`;
      default:
        return baseClasses;
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Nenhum projeto disponível</p>
      </div>
    );
  }

  const visibleProjects = getVisibleProjects();

  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* Container do carrossel */}
      <div className="flex items-center justify-center gap-8 px-8">
        {visibleProjects.map(({ project, position }, idx) => (
          project && (
            <div
              key={`${project.id}-${idx}`}
              className={getCardClasses(position)}
            >
              <ProjectCard project={project} />
            </div>
          )
        ))}
      </div>

      {/* Indicadores de navegação */}
      <div className="flex justify-center gap-2 mt-8">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Ir para projeto ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
