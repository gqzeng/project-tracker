export type CategoryColor =
  | 'violet' | 'sky' | 'teal' | 'rose' | 'amber'
  | 'lime' | 'orange' | 'pink' | 'cyan' | 'indigo';

export interface Category {
  id: number;
  name: string;
  color: CategoryColor;
  created_at: string;
  product_count: number;
}

export type ProductStatus = 'in_garage' | 'in_kitchen' | 'in_dining_room' | 'in_living_room';
export type ProjectStatus = 'active' | 'planned' | 'paused' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface Product {
  id: number;
  name: string;
  description?: string;
  status: ProductStatus;
  priority: Priority;
  category_id?: number;
  category_name?: string;
  category_color?: CategoryColor;
  staging_url?: string;
  live_url?: string;
  code_repo?: string;
  hosting_platform?: string;
  network_access?: string;
  tech_stack?: string[];
  doc_url?: string;
  features?: string[];
  notes?: string;
  project_count: number;
  task_count: number;
  task_done_count: number;
  projects?: Project[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  product_id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  task_count: number;
  task_done_count: number;
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  status: TaskStatus;
  priority: Priority;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithProduct extends Project {
  product_name: string;
  product_status: ProductStatus;
  product_priority: Priority;
}

export interface TaskWithContext extends Task {
  project_name: string;
  product_id: number;
  product_name: string;
}

export interface ProductFilters {
  status?: ProductStatus | '';
  category_id?: number | '';
  priority?: Priority | '';
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
