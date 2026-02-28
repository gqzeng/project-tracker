import { useState } from 'react';
import { useCategories } from '../../api/categories';
import { CategoryItem } from '../categories/CategoryItem';
import { CategoryModal } from '../categories/CategoryModal';
import { PRODUCT_STATUS_CONFIG, PRIORITY_CONFIG, PRODUCT_STATUSES, PRIORITIES, STATUS_CONFIG, PROJECT_STATUSES, TASK_STATUS_CONFIG, TASK_STATUSES } from '../../utils/constants';
import type { Category, ProductFilters, Priority, ProjectStatus, TaskStatus } from '../../types';

interface SidebarProps {
  filters: ProductFilters;
  onFilterChange: (f: Partial<ProductFilters>) => void;
  onNewProduct: () => void;
  onNewProject: () => void;
  onNewTask: () => void;
  projectStatusFilter: ProjectStatus | '';
  onProjectStatusFilter: (s: ProjectStatus | '') => void;
  taskStatusFilter: TaskStatus | '';
  onTaskStatusFilter: (s: TaskStatus | '') => void;
}

export function Sidebar({
  filters,
  onFilterChange,
  onNewProduct,
  onNewProject,
  onNewTask,
  projectStatusFilter,
  onProjectStatusFilter,
  taskStatusFilter,
  onTaskStatusFilter,
}: SidebarProps) {
  const { data: categories = [] } = useCategories();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <>
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">App Garden</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-5">
          {/* Create actions */}
          <div className="px-3 space-y-1">
            <button
              onClick={onNewProduct}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Product
            </button>
            <button
              onClick={onNewProject}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
            <button
              onClick={onNewTask}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>

          {/* All products */}
          <div className="px-3">
            <button
              onClick={() => onFilterChange({ status: '', category_id: '' })}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                !filters.status && !filters.category_id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Products
            </button>
          </div>

          {/* Development Stage filters */}
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1">Development Stage</p>
            <div className="space-y-0.5">
              {PRODUCT_STATUSES.map(s => {
                const cfg = PRODUCT_STATUS_CONFIG[s];
                const isActive = filters.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onFilterChange({ status: isActive ? '' : s, category_id: '' })}
                    className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      isActive ? `${cfg.bg} ${cfg.text} font-medium` : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs">{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority filters */}
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1">Priority</p>
            <div className="space-y-0.5">
              {PRIORITIES.map(p => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = filters.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => onFilterChange({ priority: isActive ? '' : (p as Priority), status: '' })}
                    className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      isActive ? 'bg-gray-100 font-medium text-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Status filters */}
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1">Project Status</p>
            <div className="space-y-0.5">
              {PROJECT_STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s];
                const isActive = projectStatusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => onProjectStatusFilter(isActive ? '' : s)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      isActive ? `${cfg.bg} ${cfg.text} font-medium` : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs">{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Status filters */}
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1">Task Status</p>
            <div className="space-y-0.5">
              {TASK_STATUSES.map(s => {
                const cfg = TASK_STATUS_CONFIG[s];
                const isActive = taskStatusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => onTaskStatusFilter(isActive ? '' : s)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      isActive ? `${cfg.bg} ${cfg.text} font-medium` : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Functional Areas */}
          <div className="px-3">
            <div className="flex items-center justify-between px-3 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Functional Areas</p>
              <button
                onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="New functional area"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {categories.map(cat => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  isActive={filters.category_id === cat.id}
                  onClick={() => onFilterChange({ category_id: filters.category_id === cat.id ? '' : cat.id, status: '' })}
                  onEdit={() => handleEditCategory(cat)}
                />
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">No categories yet</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      <CategoryModal
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        editing={editingCategory}
      />
    </>
  );
}
