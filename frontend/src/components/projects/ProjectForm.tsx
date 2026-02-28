import { useState, useEffect } from 'react';
import { useCreateProject, useUpdateProject } from '../../api/projects';
import { useProducts } from '../../api/products';
import { Modal } from '../ui/Modal';
import { PROJECT_STATUSES, PRIORITIES, STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';
import type { Project, ProjectStatus, Priority } from '../../types';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  productId?: number;
  editing?: Project | null;
}

interface FormState {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
}

const DEFAULT_FORM: FormState = {
  name: '',
  description: '',
  status: 'planned',
  priority: 'medium',
};

export function ProjectForm({ open, onClose, productId, editing }: ProjectFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: allProducts = [] } = useProducts();

  // Only show product selector when creating (not editing) without a pre-selected product
  const needsProductSelector = !productId && !editing;
  const effectiveProductId = productId ?? (typeof selectedProductId === 'number' ? selectedProductId : undefined);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description || '',
        status: editing.status,
        priority: editing.priority,
      });
    } else {
      setForm(DEFAULT_FORM);
      setSelectedProductId('');
    }
  }, [editing, open]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const isPending = createProject.isPending || updateProject.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description || undefined,
    };
    try {
      if (editing) {
        await updateProject.mutateAsync({ id: editing.id, ...payload });
      } else if (effectiveProductId) {
        await createProject.mutateAsync({ productId: effectiveProductId, ...payload });
      }
      onClose();
    } catch {
      // error shown implicitly
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Project' : 'New Project'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {needsProductSelector && (
          <div>
            <label className={labelCls}>Product <span className="text-red-400">*</span></label>
            {allProducts.length === 0 ? (
              <p className="text-sm text-gray-400 px-1">No products yet — create a product first.</p>
            ) : (
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(Number(e.target.value) || '')}
                required
                className={inputCls}
              >
                <option value="">Select a product…</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
        <div>
          <label className={labelCls}>Name <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Project name"
            className={inputCls}
            autoFocus
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            placeholder="What needs to be done?"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              {PROJECT_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select value={form.priority} onChange={set('priority')} className={inputCls}>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !form.name.trim() || (needsProductSelector && !selectedProductId)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
