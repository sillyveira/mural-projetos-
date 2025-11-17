import { QRCodeSVG } from 'qrcode.react';
import { colors, fonts } from '../utils/theme';
import { type Project } from '@/lib/projects';

export type ProjectStatus = 'FINALIZADO' | 'EM DESENVOLVIMENTO';



interface ProjectCardProps {
  project: Project;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  'FINALIZADO': { label: 'FINALIZADO', className: 'bg-status-live text-white' },
  'EM DESENVOLVIMENTO': { label: 'EM DESENVOLVIMENTO', className: 'bg-status-development text-white' },
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const statusInfo = statusConfig[project.status] || statusConfig['EM DESENVOLVIMENTO'];

  return (
    <div className={`relative ${colors.background.card} ${colors.border.default} ${colors.border.hover} rounded-lg overflow-hidden transition-all duration-300 group h-full flex flex-col`}>
      {/* Status Badge */}
      <div 
         
        className={`absolute top-3 right-3 ${fonts.title} text-xs tracking-wider px-3 py-1 rounded z-10 ${statusInfo.className}`}
      >
        {statusInfo.label}
      </div>

      {/* Project Image */}
      <div className={`relative w-full h-64 overflow-hidden ${colors.background.secondary}`}>
        <img 
          src={project.imageUrl} 
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className={`p-6 flex-1 flex flex-col ${colors.background.card}`}>
        {/* Project Title */}
        <h3 className={`${fonts.title} text-3xl md:text-4xl mb-3 ${colors.text.white} tracking-wide uppercase`}>
          {project.title}
        </h3>

        {/* Description */}
        <p className={`${fonts.body} text-sm md:text-base ${colors.text.subtle} mb-4 leading-relaxed flex-1`}>
          {project.description}
        </p>

        {/* Footer with Author and GitHub */}
        <div className={`flex items-end justify-between gap-4 pt-4`}>
          <div className="flex-1">
            <p className={`${fonts.body} text-xs text-gray-400 mb-2`}>
              Por <span className={`${colors.text.gray} font-medium`}>{project.author}</span>
            </p>
            <a 
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${fonts.body} text-xs ${colors.text.link} hover:underline break-all line-clamp-2 transition-colors`}
            >
              {project.githubUrl}
            </a>
          </div>

          {/* QR Code */}
          <div className="bg-white p-2 rounded shrink-0 group-hover:scale-105 transition-transform">
            <QRCodeSVG 
              value={project.githubUrl} 
              size={100}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};