'use client'

import Header from './components/Header';
import { ProjectCarousel } from './components/ProjectCarousel';
import { type Project } from '@/lib/projects';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';


export default function Home() {
  const [projetos, setProjetos] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/');
        
        if (response.status === 200) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const newProjects = result.data as Project[];
            
            // Filtra apenas projetos que ainda não existem na lista
            const existingIds = new Set(projetos.map(p => p.id));
            const trulyNewProjects = newProjects.filter(p => !existingIds.has(p.id));
            
            if (trulyNewProjects.length > 0) {
              // Adiciona novos projetos à lista existente
              setProjetos(prevProjects => [...prevProjects, ...trulyNewProjects]);
              
              // Mostra toast com a quantidade de novos projetos
              toast.success(
                `${trulyNewProjects.length} ${trulyNewProjects.length === 1 ? 'novo projeto adicionado' : 'novos projetos adicionados'}!`,
                {
                  duration: 4000,
                  position: 'top-right',
                  style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                }
              );
            } else if (projetos.length === 0) {
              // Primeira carga - apenas define os projetos sem toast
              setProjetos(newProjects);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        toast.error('Erro ao carregar projetos', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255, 100, 100, 0.5)',
          },
        });
      }
    };

    fetchProjects();
    
    // Opcional: buscar novos projetos periodicamente (a cada 30 segundos)
    const interval = setInterval(fetchProjects, 30000);
    
    return () => clearInterval(interval);
  }, [projetos]);

  return (
    <main className="bg-primary min-h-screen">
      <Toaster />
      <Header />

      <div className=''>
        {
          projetos.length > 0 && <ProjectCarousel 
          projects={projetos}
          visibleCount={4}
          autoPlayInterval={5000}
        />
        }
      </div>

    </main>
  );
}
