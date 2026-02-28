import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';
import type { Project } from '../../types';

interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  productName?: string;
}

export function ProjectItem({ project, isSelected, onSelect, onEdit, productName }: ProjectItemProps) {
  const statusCfg = STATUS_CONFIG[project.status];
  const priorityCfg = PRIORITY_CONFIG[project.priority];

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 ring-1 ring-blue-200'
          : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityCfg.dot}`} />

      {/* Name */}
      <span className="text-sm text-gray-800 flex-1 truncate font-medium">{project.name}</span>

      {/* Status badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusCfg.bg} ${statusCfg.text}`}>
        {statusCfg.label}
      </span>

      {/* Product name */}
      {productName && (
        <span className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block truncate max-w-[120px]">
          {productName}
        </span>
      )}

      {/* Task count */}
      {project.task_count > 0 && (
        <span className="text-[10px] text-gray-400 flex-shrink-0">
          {project.task_done_count}/{project.task_count}
        </span>
      )}

      {/* Edit button (hover) */}
      <button
        onClick={e => { e.stopPropagation(); onEdit(); }}
        className="hidden group-hover:block p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
        title="Edit project"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}
