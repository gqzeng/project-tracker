import { useState } from 'react';
import { CATEGORY_COLORS } from '../../utils/constants';
import { useDeleteCategory } from '../../api/categories';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { Category } from '../../types';

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
}

export function CategoryItem({ category, isActive, onClick, onEdit }: CategoryItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteCategory = useDeleteCategory();
  const cfg = CATEGORY_COLORS[category.color];

  return (
    <>
      <div
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          isActive ? `${cfg.bg} ${cfg.text}` : 'hover:bg-gray-100 text-gray-700'
        }`}
        onClick={onClick}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="text-sm font-medium flex-1 truncate">{category.name}</span>
        <span className={`text-xs ${isActive ? cfg.text : 'text-gray-400'}`}>
          {category.product_count}
        </span>
        <div className="hidden group-hover:flex items-center gap-1 ml-1">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-1 rounded hover:bg-black/10 text-current opacity-60 hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setConfirmOpen(true); }}
            className="p-1 rounded hover:bg-black/10 text-current opacity-60 hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Functional Area"
        message={`Delete "${category.name}"? Products in this area will become unassigned.`}
        onConfirm={() => { deleteCategory.mutate(category.id); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
