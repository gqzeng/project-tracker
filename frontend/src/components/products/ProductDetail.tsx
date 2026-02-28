import { useState } from 'react';
import { useProduct, useDeleteProduct } from '../../api/products';
import { Badge } from '../ui/Badge';
import { ColorDot } from '../ui/ColorDot';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Spinner } from '../ui/Spinner';
import { PRODUCT_STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

interface ProductDetailProps {
  productId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
  onNewProject: (productId: number) => void;
  onSelectProject: (id: number) => void;
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 w-20 flex-shrink-0">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:text-blue-700 hover:underline truncate"
      >
        {href}
      </a>
    </div>
  );
}

export function ProductDetail({ productId, onClose, onEdit, onNewProject, onSelectProject }: ProductDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: product, isLoading } = useProduct(productId);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    await deleteProduct.mutateAsync(productId);
    onClose();
  };

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  const statusCfg = PRODUCT_STATUS_CONFIG[product.status];
  const priorityCfg = PRIORITY_CONFIG[product.priority];
  const categoryCfg = product.category_color ? CATEGORY_COLORS[product.category_color] : null;

  const hasLinks = product.live_url || product.staging_url || product.code_repo || product.doc_url;
  const hasInfra = product.hosting_platform || product.network_access;

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <Badge label={statusCfg.label} bg={statusCfg.bg} text={statusCfg.text} icon={statusCfg.icon} />
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 ${priorityCfg.text}`}>
              <ColorDot dotClass={priorityCfg.dot} size="sm" />
              {priorityCfg.label}
            </span>
            {categoryCfg && product.category_name && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${categoryCfg.bg} ${categoryCfg.text}`}>
                {product.category_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(product.id)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Summary counts */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{product.project_count} {product.project_count === 1 ? 'project' : 'projects'}</span>
          {product.task_count > 0 && (
            <span>{product.task_done_count}/{product.task_count} tasks done</span>
          )}
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Projects</p>
            <button
              onClick={() => onNewProject(productId)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New project
            </button>
          </div>
          {(product.projects ?? []).length === 0 ? (
            <p className="text-xs text-gray-400 italic">No projects yet</p>
          ) : (
            <ul className="space-y-0.5">
              {(product.projects ?? []).map(proj => (
                <li key={proj.id}>
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="w-full flex items-center gap-2 text-xs text-gray-700 py-1 px-2 -mx-2 rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors text-left group"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      proj.status === 'active' ? 'bg-green-500' :
                      proj.status === 'completed' ? 'bg-blue-400' :
                      proj.status === 'paused' ? 'bg-amber-400' : 'bg-gray-300'
                    }`} />
                    <span className="flex-1 truncate group-hover:underline">{proj.name}</span>
                    <span className="text-gray-400 flex-shrink-0 group-hover:text-gray-500">{proj.task_done_count}/{proj.task_count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Features</p>
            <ul className="space-y-1">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        {hasLinks && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Links</p>
            <div className="space-y-1.5">
              {product.live_url && <LinkRow label="Live" href={product.live_url} />}
              {product.staging_url && <LinkRow label="Staging" href={product.staging_url} />}
              {product.code_repo && <LinkRow label="Code" href={product.code_repo} />}
              {product.doc_url && <LinkRow label="Docs" href={product.doc_url} />}
            </div>
          </div>
        )}

        {/* Infrastructure */}
        {hasInfra && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Infrastructure</p>
            <div className="space-y-1">
              {product.hosting_platform && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-20 flex-shrink-0">Hosting</span>
                  <span className="text-xs text-gray-700">{product.hosting_platform}</span>
                </div>
              )}
              {product.network_access && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-20 flex-shrink-0">Network</span>
                  <span className="text-xs text-gray-700">{product.network_access}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {product.tech_stack && product.tech_stack.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {product.tech_stack.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {product.notes && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 space-y-0.5">
          <p>Created {formatDate(product.created_at)}</p>
          <p>Updated {formatDate(product.updated_at)}</p>
        </div>
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
