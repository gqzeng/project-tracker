import type { CategoryColor, ProductStatus, ProjectStatus, Priority, TaskStatus } from '../types';

// All class strings are COMPLETE literals — never use template interpolation
// so Tailwind's scanner picks them up correctly.

export const CATEGORY_COLORS: Record<CategoryColor, { bg: string; text: string; dot: string; border: string; header: string }> = {
  violet: { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500', border: 'border-violet-300', header: 'bg-violet-50' },
  sky:    { bg: 'bg-sky-100',    text: 'text-sky-800',    dot: 'bg-sky-500',    border: 'border-sky-300',    header: 'bg-sky-50'    },
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-500',   border: 'border-teal-300',   header: 'bg-teal-50'   },
  rose:   { bg: 'bg-rose-100',   text: 'text-rose-800',   dot: 'bg-rose-500',   border: 'border-rose-300',   header: 'bg-rose-50'   },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500',  border: 'border-amber-300',  header: 'bg-amber-50'  },
  lime:   { bg: 'bg-lime-100',   text: 'text-lime-800',   dot: 'bg-lime-500',   border: 'border-lime-300',   header: 'bg-lime-50'   },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', border: 'border-orange-300', header: 'bg-orange-50' },
  pink:   { bg: 'bg-pink-100',   text: 'text-pink-800',   dot: 'bg-pink-500',   border: 'border-pink-300',   header: 'bg-pink-50'   },
  cyan:   { bg: 'bg-cyan-100',   text: 'text-cyan-800',   dot: 'bg-cyan-500',   border: 'border-cyan-300',   header: 'bg-cyan-50'   },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500', border: 'border-indigo-300', header: 'bg-indigo-50' },
};

export const ALL_COLORS: CategoryColor[] = [
  'violet', 'sky', 'teal', 'rose', 'amber',
  'lime', 'orange', 'pink', 'cyan', 'indigo',
];

// Product statuses — development lifecycle stages
export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { label: string; bg: string; text: string; icon: string; border: string; header: string; dot: string }> = {
  in_living_room: { label: 'In Planning',    bg: 'bg-violet-100', text: 'text-violet-800', icon: '★', border: 'border-violet-300', header: 'bg-violet-50', dot: 'bg-violet-500' },
  in_kitchen:     { label: 'In Development', bg: 'bg-orange-100', text: 'text-orange-800', icon: '▸', border: 'border-orange-300', header: 'bg-orange-50', dot: 'bg-orange-500' },
  in_dining_room: { label: 'In Production',  bg: 'bg-green-100',  text: 'text-green-800',  icon: '✓', border: 'border-green-300',  header: 'bg-green-50',  dot: 'bg-green-500'  },
  in_garage:      { label: 'In Storage',     bg: 'bg-slate-100',  text: 'text-slate-700',  icon: '▪', border: 'border-slate-300',  header: 'bg-slate-50',  dot: 'bg-slate-400'  },
};

export const PRODUCT_STATUSES: ProductStatus[] = ['in_living_room', 'in_kitchen', 'in_dining_room', 'in_garage'];

// Project statuses
export const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; text: string; icon: string; border: string; header: string; dot: string }> = {
  active:    { label: 'Active',    bg: 'bg-green-100',  text: 'text-green-800',  icon: '▶', border: 'border-green-300',  header: 'bg-green-50',  dot: 'bg-green-500'  },
  planned:   { label: 'Planned',   bg: 'bg-blue-100',   text: 'text-blue-800',   icon: '◷', border: 'border-blue-300',   header: 'bg-blue-50',   dot: 'bg-blue-500'   },
  paused:    { label: 'Paused',    bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏸', border: 'border-yellow-300', header: 'bg-yellow-50', dot: 'bg-yellow-500' },
  completed: { label: 'Completed', bg: 'bg-gray-100',   text: 'text-gray-600',   icon: '✓', border: 'border-gray-300',   header: 'bg-gray-50',   dot: 'bg-gray-400'   },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  todo:        { label: 'To Do',       bg: 'bg-gray-100',   text: 'text-gray-700',  dot: 'bg-gray-400'  },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100',   text: 'text-blue-700',  dot: 'bg-blue-400'  },
  done:        { label: 'Done',        bg: 'bg-green-100',  text: 'text-green-700', dot: 'bg-green-400' },
  blocked:     { label: 'Blocked',     bg: 'bg-red-100',    text: 'text-red-700',   dot: 'bg-red-400'   },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; ring: string; text: string; border: string; header: string }> = {
  high:   { label: 'High',   dot: 'bg-red-500',    ring: 'ring-red-200',    text: 'text-red-700',    border: 'border-red-300',    header: 'bg-red-50'    },
  medium: { label: 'Medium', dot: 'bg-orange-400', ring: 'ring-orange-200', text: 'text-orange-700', border: 'border-orange-300', header: 'bg-orange-50' },
  low:    { label: 'Low',    dot: 'bg-slate-300',  ring: 'ring-slate-200',  text: 'text-slate-600',  border: 'border-slate-300',  header: 'bg-slate-50'  },
};

export const PROJECT_STATUSES: ProjectStatus[] = ['active', 'planned', 'paused', 'completed'];
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
