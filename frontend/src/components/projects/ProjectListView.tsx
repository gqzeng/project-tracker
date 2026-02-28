import { useMemo } from 'react';
import { useAllProjects } from '../../api/projects';
import { ProjectItem } from './ProjectItem';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { STATUS_CONFIG, PRIORITY_CONFIG, PRODUCT_STATUS_CONFIG, PROJECT_STATUSES } from '../../utils/constants';
import type { Project, ProjectWithProduct, ProjectStatus, Priority, ProductStatus } from '../../types';

export type ProjectGroupBy = 'product' | 'status' | 'priority';

interface Group {
  key: string;
  label: string;
  dot?: string;
  border: string;
  header: string;
  textClass: string;
  items: ProjectWithProduct[];
}

function groupByProduct(projects: ProjectWithProduct[]): Group[] {
  const map = new Map<string, Group>();
  for (const p of projects) {
    const key = p.product_name;
    if (!map.has(key)) {
      const cfg = PRODUCT_STATUS_CONFIG[p.product_status as ProductStatus];
      map.set(key, {
        key,
        label: p.product_name,
        dot: cfg.dot,
        border: cfg.border,
        header: cfg.header,
        textClass: cfg.text,
        items: [],
      });
    }
    map.get(key)!.items.push(p);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function groupByStatus(projects: ProjectWithProduct[]): Group[] {
  const map = new Map<ProjectStatus, Group>();
  for (const s of PROJECT_STATUSES) {
    const cfg = STATUS_CONFIG[s];
    map.set(s, {
      key: s,
      label: cfg.label,
      dot: cfg.dot,
      border: cfg.border,
      header: cfg.header,
      textClass: cfg.text,
      items: [],
    });
  }
  for (const p of projects) {
    map.get(p.status)?.items.push(p);
  }
  return [...map.values()].filter(g => g.items.length > 0);
}

function groupByPriority(projects: ProjectWithProduct[]): Group[] {
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
  for (const p of projects) {
    map.get(p.priority)?.items.push(p);
  }
  return [...map.values()].filter(g => g.items.length > 0);
}

interface ProjectListViewProps {
  groupBy: ProjectGroupBy;
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onEditProject: (project: Project) => void;
  statusFilter?: ProjectStatus;
}

export function ProjectListView({ groupBy, selectedProjectId, onSelectProject, onEditProject, statusFilter }: ProjectListViewProps) {
  const { data: projects = [], isLoading } = useAllProjects();

  const groups = useMemo(() => {
    const filtered = statusFilter ? projects.filter(p => p.status === statusFilter) : projects;
    if (groupBy === 'status') return groupByStatus(filtered);
    if (groupBy === 'priority') return groupByPriority(filtered);
    return groupByProduct(filtered);
  }, [projects, groupBy, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Expand a product card and add a project to get started."
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
          <div className="space-y-0.5">
            {group.items.map(proj => (
              <ProjectItem
                key={proj.id}
                project={proj}
                isSelected={selectedProjectId === proj.id}
                onSelect={() => onSelectProject(proj.id)}
                onEdit={() => onEditProject(proj)}
                productName={groupBy !== 'product' ? proj.product_name : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
