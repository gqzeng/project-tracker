import { useState } from 'react';
import { useUpdateTask, useDeleteTask } from '../../api/tasks';
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG, TASK_STATUSES } from '../../utils/constants';
import type { Task, TaskStatus } from '../../types';

interface TaskItemProps {
  task: Task;
  projectId: number;
}

export function TaskItem({ task, projectId }: TaskItemProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const statusCfg = TASK_STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ id: task.id, status });
  };

  const handleTitleSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask.mutate({ id: task.id, title: trimmed });
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  };

  return (
    <div className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Status checkbox (toggle done/todo) */}
      <button
        onClick={() => handleStatusChange(task.status === 'done' ? 'todo' : 'done')}
        className="flex-shrink-0"
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          task.status === 'done'
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          {task.status === 'done' && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </button>

      {/* Title */}
      {editingTitle ? (
        <input
          autoFocus
          value={titleValue}
          onChange={e => setTitleValue(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={e => {
            if (e.key === 'Enter') handleTitleSave();
            if (e.key === 'Escape') { setTitleValue(task.title); setEditingTitle(false); }
          }}
          className="flex-1 text-sm border-b border-blue-300 outline-none bg-transparent"
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-text ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}
          onDoubleClick={() => setEditingTitle(true)}
          title="Double-click to edit"
        >
          {task.title}
        </span>
      )}

      {/* Status select */}
      <select
        value={task.status}
        onChange={e => handleStatusChange(e.target.value as TaskStatus)}
        className={`text-xs rounded-full px-2 py-0.5 border-0 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 ${statusCfg.bg} ${statusCfg.text}`}
      >
        {TASK_STATUSES.map(s => (
          <option key={s} value={s}>{TASK_STATUS_CONFIG[s].label}</option>
        ))}
      </select>

      {/* Priority dot */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityCfg.dot}`}
        title={`Priority: ${priorityCfg.label}`}
      />

      {/* Delete */}
      <button
        onClick={() => deleteTask.mutate(task.id)}
        className="hidden group-hover:block text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
