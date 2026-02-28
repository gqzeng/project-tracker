import { useState, useEffect } from 'react';
import { useAllProjects } from '../../api/projects';
import { useCreateTask } from '../../api/tasks';
import { Modal } from '../ui/Modal';
import { TASK_STATUSES, PRIORITIES, TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';
import type { TaskStatus, Priority } from '../../types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
}

export function TaskForm({ open, onClose }: TaskFormProps) {
  const { data: projects = [] } = useAllProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');

  const projectId = typeof selectedProjectId === 'number' ? selectedProjectId : 0;
  const createTask = useCreateTask(projectId);

  useEffect(() => {
    if (open) {
      setSelectedProjectId('');
      setTitle('');
      setStatus('todo');
      setPriority('medium');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await createTask.mutateAsync({ title, status, priority });
      onClose();
    } catch {
      // error shown implicitly
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  return (
    <Modal open={open} onClose={onClose} title="New Task" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Project <span className="text-red-400">*</span></label>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 px-1">No projects yet — create a project first.</p>
          ) : (
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(Number(e.target.value) || '')}
              required
              className={inputCls}
            >
              <option value="">Select a project…</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.product_name} › {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelCls}>Title <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task name"
            className={inputCls}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className={inputCls}
            >
              {TASK_STATUSES.map(s => (
                <option key={s} value={s}>{TASK_STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className={inputCls}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTask.isPending || !title.trim() || !projectId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {createTask.isPending ? 'Saving…' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
