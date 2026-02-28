import { useState } from 'react';
import { useProject, useDeleteProject } from '../../api/projects';
import { TaskItem } from '../tasks/TaskItem';
import { AddTaskRow } from '../tasks/AddTaskRow';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Spinner } from '../ui/Spinner';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { Project } from '../../types';

interface ProjectDetailProps {
  projectId: number;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectDetail({ projectId, onClose, onEdit }: ProjectDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: project, isLoading } = useProject(projectId);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    await deleteProject.mutateAsync(projectId);
    onClose();
  };

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[project.status];
  const priorityCfg = PRIORITY_CONFIG[project.priority];
  const tasks = project.tasks ?? [];

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm leading-snug">{project.name}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <Badge label={statusCfg.label} bg={statusCfg.bg} text={statusCfg.text} icon={statusCfg.icon} />
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 ${priorityCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
              {priorityCfg.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        {project.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Tasks
              {tasks.length > 0 && (
                <span className="ml-1 font-normal text-gray-300">
                  {tasks.filter(t => t.status === 'done').length}/{tasks.length}
                </span>
              )}
            </p>
          </div>
          <div className="space-y-0.5">
            {tasks.map(t => (
              <TaskItem key={t.id} task={t} projectId={project.id} />
            ))}
          </div>
          <div className="mt-1">
            <AddTaskRow projectId={project.id} />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 space-y-0.5">
          <p>Created {formatDate(project.created_at)}</p>
          <p>Updated {formatDate(project.updated_at)}</p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Project"
        message={`Delete "${project.name}"? This will also delete all its tasks.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
