import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ProductList } from '../products/ProductList';
import { ProductDetail } from '../products/ProductDetail';
import { ProjectDetail } from '../projects/ProjectDetail';
import { ProjectListView } from '../projects/ProjectListView';
import { TaskListView } from '../tasks/TaskListView';
import { TaskForm } from '../tasks/TaskForm';
import { ProductForm } from '../products/ProductForm';
import { ProjectForm } from '../projects/ProjectForm';
import { useProduct } from '../../api/products';
import type { ProductFilters, Project, ProjectStatus, TaskStatus } from '../../types';
import type { GroupBy } from '../products/ProductList';
import type { ProjectGroupBy } from '../projects/ProjectListView';
import type { TaskGroupBy } from '../tasks/TaskListView';

type ViewMode = 'products' | 'projects' | 'tasks';

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'products', label: 'Products' },
  { value: 'projects', label: 'Projects' },
  { value: 'tasks',    label: 'Tasks'    },
];

const GROUP_BY_OPTIONS: Record<ViewMode, { value: string; label: string }[]> = {
  products: [
    { value: 'category', label: 'Area'     },
    { value: 'status',   label: 'Stage'    },
    { value: 'priority', label: 'Priority' },
  ],
  projects: [
    { value: 'product',  label: 'Product'  },
    { value: 'status',   label: 'Status'   },
    { value: 'priority', label: 'Priority' },
  ],
  tasks: [
    { value: 'project',  label: 'Project'  },
    { value: 'status',   label: 'Status'   },
    { value: 'priority', label: 'Priority' },
  ],
};

const DEFAULT_GROUP_BY: Record<ViewMode, string> = {
  products: 'category',
  projects: 'product',
  tasks: 'project',
};

export function AppShell() {
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [groupBy, setGroupBy] = useState<string>('category');
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Project modal state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Sidebar filter state for projects and tasks
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatus | ''>('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | ''>('');

  // Pre-fetch editing product for the form
  const { data: editingProduct } = useProduct(editingProductId);

  const handleFilterChange = (partial: Partial<ProductFilters>) => {
    setFilters(f => ({ ...f, ...partial }));
  };

  const handleViewChange = (v: ViewMode) => {
    setViewMode(v);
    setGroupBy(DEFAULT_GROUP_BY[v]);
    // Clear selections and sidebar filters when switching views
    setSelectedProductId(null);
    setSelectedProjectId(null);
    setProjectStatusFilter('');
    setTaskStatusFilter('');
  };

  const handleToggleProduct = (id: number) => {
    setExpandedProductId(prev => prev === id ? null : id);
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProductId(prev => prev === id ? null : id);
    setSelectedProjectId(null);
  };

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(prev => prev === id ? null : id);
    setSelectedProductId(null);
  };

  // Product CRUD
  const handleNewProduct = () => {
    setEditingProductId(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (id: number) => {
    setEditingProductId(id);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
    setEditingProductId(null);
  };

  // Project CRUD
  const handleNewProject = (productId: number) => {
    setEditingProject(null);
    setActiveProductId(productId);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setActiveProductId(project.product_id);
    setProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
    setActiveProductId(null);
  };

  // New project from sidebar (no pre-selected product)
  const handleNewProjectFromSidebar = () => {
    setEditingProject(null);
    setActiveProductId(null);
    setProjectModalOpen(true);
  };

  const handleNewTask = () => setTaskModalOpen(true);
  const handleCloseTaskModal = () => setTaskModalOpen(false);

  const handleProjectStatusFilter = (status: ProjectStatus | '') => {
    setProjectStatusFilter(status);
    if (status) setViewMode('projects');
  };

  const handleTaskStatusFilter = (status: TaskStatus | '') => {
    setTaskStatusFilter(status);
    if (status) setViewMode('tasks');
  };

  const handleCloseProductDetail = () => setSelectedProductId(null);
  const handleCloseProjectDetail = () => setSelectedProjectId(null);

  const topBarTitle = viewMode === 'projects'
    ? 'All Projects'
    : viewMode === 'tasks'
    ? 'All Tasks'
    : filters.category_id
    ? 'By Functional Area'
    : filters.status
    ? 'By Stage'
    : filters.priority
    ? 'By Priority'
    : 'All Products';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        onNewProduct={handleNewProduct}
        onNewProject={handleNewProjectFromSidebar}
        onNewTask={handleNewTask}
        projectStatusFilter={projectStatusFilter}
        onProjectStatusFilter={handleProjectStatusFilter}
        taskStatusFilter={taskStatusFilter}
        onTaskStatusFilter={handleTaskStatusFilter}
      />

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center gap-4">
          <h1 className="text-sm font-semibold text-gray-900 flex-shrink-0">{topBarTitle}</h1>

          <div className="flex items-center gap-3 ml-auto">
            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              {VIEW_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleViewChange(opt.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === opt.value
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Group by toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              <span className="text-[10px] text-gray-400 pl-2 pr-1 font-medium uppercase tracking-wide select-none">Group</span>
              {GROUP_BY_OPTIONS[viewMode].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGroupBy(opt.value)}
                  title={`Group by ${opt.label}`}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    groupBy === opt.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort (products only) */}
            {viewMode === 'products' && (
              <select
                value={`${filters.sort || 'updated_at'}:${filters.order || 'desc'}`}
                onChange={e => {
                  const [sort, order] = e.target.value.split(':');
                  handleFilterChange({ sort, order: order as 'asc' | 'desc' });
                }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="updated_at:desc">Recently updated</option>
                <option value="created_at:desc">Recently created</option>
                <option value="name:asc">Name A–Z</option>
                <option value="name:desc">Name Z–A</option>
                <option value="priority:desc">Priority ↓</option>
              </select>
            )}
          </div>
        </div>

        {viewMode === 'products' && (
          <ProductList
            filters={filters}
            groupBy={groupBy as GroupBy}
            expandedProductId={expandedProductId}
            onToggleProduct={handleToggleProduct}
            selectedProductId={selectedProductId}
            onSelectProduct={handleSelectProduct}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            onNewProduct={handleNewProduct}
            onEditProduct={handleEditProduct}
            onNewProject={handleNewProject}
            onEditProject={handleEditProject}
          />
        )}

        {viewMode === 'projects' && (
          <ProjectListView
            groupBy={groupBy as ProjectGroupBy}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            onEditProject={handleEditProject}
            statusFilter={projectStatusFilter || undefined}
          />
        )}

        {viewMode === 'tasks' && (
          <TaskListView
            groupBy={groupBy as TaskGroupBy}
            onSelectProject={handleSelectProject}
            statusFilter={taskStatusFilter || undefined}
          />
        )}
      </main>

      {/* Right panel — product detail */}
      {selectedProductId !== null && (
        <aside className="w-96 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
          <ProductDetail
            productId={selectedProductId}
            onClose={handleCloseProductDetail}
            onEdit={handleEditProduct}
            onNewProject={handleNewProject}
            onSelectProject={handleSelectProject}
          />
        </aside>
      )}

      {/* Right panel — project detail */}
      {selectedProjectId !== null && (
        <aside className="w-96 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
          <ProjectDetail
            projectId={selectedProjectId}
            onClose={handleCloseProjectDetail}
            onEdit={handleEditProject}
          />
        </aside>
      )}

      {/* Product create/edit modal */}
      <ProductForm
        open={productModalOpen}
        onClose={handleCloseProductModal}
        editing={editingProduct || null}
      />

      {/* Project create/edit modal */}
      <ProjectForm
        open={projectModalOpen}
        onClose={handleCloseProjectModal}
        productId={activeProductId ?? undefined}
        editing={editingProject}
      />

      {/* Task create modal */}
      <TaskForm
        open={taskModalOpen}
        onClose={handleCloseTaskModal}
      />
    </div>
  );
}
