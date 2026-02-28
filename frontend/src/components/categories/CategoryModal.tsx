import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useCreateCategory, useUpdateCategory } from '../../api/categories';
import { CATEGORY_COLORS, ALL_COLORS } from '../../utils/constants';
import type { Category, CategoryColor } from '../../types';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  editing?: Category | null;
}

export function CategoryModal({ open, onClose, editing }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<CategoryColor>('sky');
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setColor(editing.color);
    } else {
      setName('');
      setColor('sky');
    }
  }, [editing, open]);

  const isPending = createCategory.isPending || updateCategory.isPending;
  const serverError = createCategory.error || updateCategory.error;
  const errorMessage = (serverError as any)?.response?.data?.detail || (serverError ? 'Save failed — check that the backend is running.' : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, name: name.trim(), color });
      } else {
        await createCategory.mutateAsync({ name: name.trim(), color });
      }
      onClose();
    } catch {
      // error displayed below form
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Functional Area' : 'New Functional Area'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Area name"
            required
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {ALL_COLORS.map(c => {
              const cfg = CATEGORY_COLORS[c];
              return (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${cfg.dot} ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                  }`}
                />
              );
            })}
          </div>
        </div>
        {errorMessage && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
