import { useState } from 'react';
import { useDeleteProduct } from '../../api/products';
import { Badge } from '../ui/Badge';
import { ColorDot } from '../ui/ColorDot';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ProjectItem } from '../projects/ProjectItem';
import { PRODUCT_STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_COLORS } from '../../utils/constants';
import type { Product, Project } from '../../types';

interface ProductCardProps {
  product: Product;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onEditProduct: (id: number) => void;
  onNewProject: (productId: number) => void;
  onEditProject: (project: Project) => void;
}

export function ProductCard({
  product,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  selectedProjectId,
  onSelectProject,
  onEditProduct,
  onNewProject,
  onEditProject,
}: ProductCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteProduct = useDeleteProduct();
  const statusCfg = PRODUCT_STATUS_CONFIG[product.status];
  const priorityCfg = PRIORITY_CONFIG[product.priority];
  const categoryCfg = product.category_color ? CATEGORY_COLORS[product.category_color] : null;

  const handleDelete = async () => {
    await deleteProduct.mutateAsync(product.id);
    setConfirmDelete(false);
  };

  return (
    <>
      <div className={`bg-white rounded-xl border transition-all duration-150 ${
        isSelected
          ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
          : isExpanded
          ? 'border-blue-200 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}>
        {/* Card header — always visible */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => onSelect(product.id)}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Expand chevron — separate from card click */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onToggle(); }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 -m-0.5 rounded"
                title={isExpanded ? 'Collapse' : 'Expand projects'}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{product.name}</h3>
            </div>
            <ColorDot
              dotClass={priorityCfg.dot}
              ringClass={priorityCfg.ring}
              title={`Priority: ${priorityCfg.label}`}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pl-6">
            <Badge label={statusCfg.label} bg={statusCfg.bg} text={statusCfg.text} icon={statusCfg.icon} />
            {categoryCfg && product.category_name && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${categoryCfg.bg} ${categoryCfg.text}`}>
                {product.category_name}
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto">
              {product.project_count} {product.project_count === 1 ? 'project' : 'projects'}
              {product.task_count > 0 && ` · ${product.task_done_count}/${product.task_count} tasks`}
            </span>
          </div>
        </div>

        {/* Expanded section */}
        {isExpanded && (
          <div className="border-t border-gray-100">
            {/* Edit/Delete actions */}
            <div className="px-4 py-2 flex items-center gap-2 bg-gray-50 rounded-b-none">
              <button
                onClick={e => { e.stopPropagation(); onEditProduct(product.id); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Product
              </button>
              <button
                onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>

            {/* Projects list */}
            <div className="px-4 py-2 space-y-1">
              {(product.projects ?? []).length === 0 ? (
                <p className="text-xs text-gray-400 py-2 text-center">No projects yet</p>
              ) : (
                (product.projects ?? []).map(proj => (
                  <ProjectItem
                    key={proj.id}
                    project={proj}
                    isSelected={selectedProjectId === proj.id}
                    onSelect={() => onSelectProject(proj.id)}
                    onEdit={() => onEditProject(proj)}
                  />
                ))
              )}
            </div>

            {/* Add project button */}
            <div className="px-4 pb-3">
              <button
                onClick={e => { e.stopPropagation(); onNewProject(product.id); }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors py-1 px-2 rounded-md hover:bg-blue-50 w-full"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add project
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Product"
        message={`Delete "${product.name}"? This will also delete all its projects and tasks.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
