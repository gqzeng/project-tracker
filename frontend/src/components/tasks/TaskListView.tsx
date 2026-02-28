import { useMemo } from 'react';
import { useAllTasks } from '../../api/tasks';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG, TASK_STATUSES } from '../../utils/constants';
import type { TaskWithContext, TaskStatus, Priority } from '../../types';

export type TaskGroupBy = 'project' | 'status' | 'priority';

interface Group {
  key: string;
  label: string;
  dot?: string;
  border: string;
  header: string;
  textClass: string;
  items: TaskWithContext[];
}

function groupByProject(tasks: TaskWithContext[]): Group[] {
  const map = new Map<string, Group>();
  for (const t of tasks) {
    const key = t.project_name;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: t.project_name,
        border: 'border-gray-300',
        header: 'bg-gray-50',
        textClass: 'text-gray-600',
        items: [],
      });
    }
    map.get(key)!.items.push(t);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function groupByStatus(tasks: TaskWithContext[]): Group[] {
  const map = new Map<TaskStatus, Group>();
  for (const s of TASK_STATUSES) {
    const cfg = TASK_STATUS_CONFIG[s];
    map.set(s, {
      key: s,
      label: cfg.label,
      border: 'border-gray-300',
      header: cfg.bg,
      textClass: cfg.text,
      items: [],
    });
  }
  for (const t of tasks) {
    map.get(t.status)?.items.push(t);
  }
  return [...map.values()].filter(g => g.items.length > 0);
}

function groupByPriority(tasks: TaskWithContext[]): Group[] {
  const ORDER: Priority[] = ['high', 'medium', 'low'];
  const map = new Map<Priority, Group>();
  for (const p of ORDER) {
    const cfg = PRIORITY_CONFIG[p];
    map.set(p, {
      key: p,
      label: cfg.label,
      dot: cfg.dot,
      border: cfg.border,
      header: cfg.header,
      textClass: cfg.text,
      items: [],
    });
  }
  for (const t of tasks) {
    map.get(t.priority)?.items.push(t);
  }
  return [...map.values()].filter(g => g.items.length > 0);
}

interface TaskListViewProps {
  groupBy: TaskGroupBy;
  onSelectProject: (id: number) => void;
  statusFilter?: TaskStatus;
}

export function TaskListView({ groupBy, onSelectProject, statusFilter }: TaskListViewProps) {
  const { data: tasks = [], isLoading } = useAllTasks();

  const groups = useMemo(() => {
    const filtered = statusFilter ? tasks.filter(t => t.status === statusFilter) : tasks;
    if (groupBy === 'status') return groupByStatus(filtered);
    if (groupBy === 'priority') return groupByPriority(filtered);
    return groupByProject(filtered);
  }, [tasks, groupBy, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Open a project and add tasks to get started."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {groups.map(group => (
        <section key={group.key}>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-2 border-l-4 ${group.header} ${group.border}`}>
            {group.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${group.dot}`} />}
            <h2 className={`text-xs font-semibold uppercase tracking-wide ${group.textClass}`}>
              {group.label}
            </h2>
            <span className={`text-xs font-normal opacity-60 ${group.textClass}`}>
              ({group.items.length})
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {group.items.map(task => {
              const statusCfg = TASK_STATUS_CONFIG[task.status];
              const priorityCfg = PRIORITY_CONFIG[task.priority];
              return (
                <button
                  key={task.id}
                  onClick={() => onSelectProject(task.project_id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left group"
                >
                  {/* Priority dot */}
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityCfg.dot}`} />

                  {/* Title */}
                  <span className={`flex-1 text-sm truncate ${
                    task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}>
                    {task.title}
                  </span>

                  {/* Status badge */}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>

                  {/* Project → Product breadcrumb */}
                  <span className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block truncate max-w-[140px]">
                    {task.product_name} › {task.project_name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
