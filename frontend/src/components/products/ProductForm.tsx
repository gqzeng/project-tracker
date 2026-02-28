import { useState, useEffect } from 'react';
import { useCategories } from '../../api/categories';
import { useCreateProduct, useUpdateProduct } from '../../api/products';
import { Modal } from '../ui/Modal';
import { TechStackInput } from './TechStackInput';
import { PRODUCT_STATUSES, PRODUCT_STATUS_CONFIG, PRIORITIES, PRIORITY_CONFIG } from '../../utils/constants';
import type { Product, ProductStatus, Priority } from '../../types';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Product | null;
}

interface FormState {
  name: string;
  description: string;
  status: ProductStatus;
  priority: Priority;
  category_id: string;
  staging_url: string;
  live_url: string;
  code_repo: string;
  doc_url: string;
  hosting_platform: string;
  network_access: string;
  tech_stack: string[];
  features: string[];
  notes: string;
}

const DEFAULT_FORM: FormState = {
  name: '',
  description: '',
  status: 'in_garage',
  priority: 'medium',
  category_id: '',
  staging_url: '',
  live_url: '',
  code_repo: '',
  doc_url: '',
  hosting_platform: '',
  network_access: '',
  tech_stack: [],
  features: [],
  notes: '',
};

// Inline Features input — one bullet per line, stored as array
function FeaturesInput({ value, onChange }: { value: string[]; onChange: (items: string[]) => void }) {
  const [input, setInput] = useState('');

  const addItem = (raw: string) => {
    const item = raw.trim();
    if (item) onChange([...value, item]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(input);
    }
  };

  const removeItem = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1.5">
      {value.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 group">
          <span className="text-gray-300 text-sm select-none">•</span>
          <span className="flex-1 text-sm text-gray-700">{item}</span>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm leading-none"
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-gray-300 text-sm select-none">•</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addItem(input); }}
          placeholder="Add a feature, press Enter…"
          className="flex-1 text-sm outline-none border-b border-gray-200 pb-0.5 focus:border-blue-400 placeholder-gray-300 bg-transparent"
        />
      </div>
    </div>
  );
}

export function ProductForm({ open, onClose, editing }: ProductFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description || '',
        status: editing.status,
        priority: editing.priority,
        category_id: editing.category_id ? String(editing.category_id) : '',
        staging_url: editing.staging_url || '',
        live_url: editing.live_url || '',
        code_repo: editing.code_repo || '',
        doc_url: editing.doc_url || '',
        hosting_platform: editing.hosting_platform || '',
        network_access: editing.network_access || '',
        tech_stack: editing.tech_stack || [],
        features: editing.features || [],
        notes: editing.notes || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editing, open]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const isPending = createProduct.isPending || updateProduct.isPending;
  const error = createProduct.error || updateProduct.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      description: form.description || undefined,
      staging_url: form.staging_url || undefined,
      live_url: form.live_url || undefined,
      code_repo: form.code_repo || undefined,
      doc_url: form.doc_url || undefined,
      hosting_platform: form.hosting_platform || undefined,
      network_access: form.network_access || undefined,
      notes: form.notes || undefined,
      tech_stack: form.tech_stack.length > 0 ? form.tech_stack : undefined,
      features: form.features.length > 0 ? form.features : undefined,
    };
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, ...payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
    } catch {
      // error displayed below submit button
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Product' : 'New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Basic Info</p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Name <span className="text-red-400">*</span></label>
              <input type="text" required value={form.name} onChange={set('name')} placeholder="Product name" className={inputCls} autoFocus />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={set('description')} placeholder="What is this product?" rows={2} className={`${inputCls} resize-none`} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Stage</label>
                <select value={form.status} onChange={set('status')} className={inputCls}>
                  {PRODUCT_STATUSES.map(s => (
                    <option key={s} value={s}>{PRODUCT_STATUS_CONFIG[s].label}</option>
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
              <div>
                <label className={labelCls}>Functional Area</label>
                <select value={form.category_id} onChange={set('category_id')} className={inputCls}>
                  <option value="">— None —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Features */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Features</p>
          <div className="px-3 py-2 border border-gray-200 rounded-lg bg-white min-h-[56px]">
            <FeaturesInput value={form.features} onChange={items => setForm(f => ({ ...f, features: items }))} />
          </div>
        </div>

        {/* Section 3: Links & Hosting */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Links & Hosting</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Live URL</label>
                <input type="url" value={form.live_url} onChange={set('live_url')} placeholder="https://…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Staging URL</label>
                <input type="url" value={form.staging_url} onChange={set('staging_url')} placeholder="https://…" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Code Repository</label>
                <input type="url" value={form.code_repo} onChange={set('code_repo')} placeholder="https://github.com/…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Documentation Link</label>
                <input type="url" value={form.doc_url} onChange={set('doc_url')} placeholder="https://docs.…" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Hosting Platform</label>
                <input type="text" value={form.hosting_platform} onChange={set('hosting_platform')} placeholder="Vercel, Render, AWS…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Network Access</label>
                <input type="text" value={form.network_access} onChange={set('network_access')} placeholder="Public, Private, VPN-only…" className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Tech Stack */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Tech Stack</p>
          <TechStackInput value={form.tech_stack} onChange={tags => setForm(f => ({ ...f, tech_stack: tags }))} />
          <p className="text-[10px] text-gray-400 mt-1">Press Enter or comma to add a technology</p>
        </div>

        {/* Section 5: Notes */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Notes</p>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Any additional notes…"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {(error as any)?.response?.data?.detail || 'Save failed — check that the backend is running.'}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending || !form.name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
