import { useState } from 'react';
import { useCreateTask } from '../../api/tasks';

interface AddTaskRowProps {
  projectId: number;
}

export function AddTaskRow({ projectId }: AddTaskRowProps) {
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState('');
  const createTask = useCreateTask(projectId);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) { setActive(false); return; }
    await createTask.mutateAsync({ title: trimmed });
    setTitle('');
    setActive(false);
  };

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-blue-500 transition-colors py-1 px-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add task
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1 px-2">
      <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') { setTitle(''); setActive(false); }
        }}
        placeholder="Task name…"
        className="flex-1 text-sm border-b border-blue-300 outline-none bg-transparent placeholder-gray-300"
      />
    </div>
  );
}
