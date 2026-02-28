import { useMemo } from 'react';
import { useProducts } from '../../api/products';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { CATEGORY_COLORS, PRODUCT_STATUS_CONFIG, PRIORITY_CONFIG, PRODUCT_STATUSES } from '../../utils/constants';
import type { Product, ProductFilters, ProductStatus, Priority, Project } from '../../types';

export type GroupBy = 'category' | 'status' | 'priority';

interface Group {
  key: string;
  label: string;
  dot?: string;
  border: string;
  header: string;
  textClass: string;
  items: Product[];
}

interface ProductListProps {
  filters: ProductFilters;
  groupBy: GroupBy;
  expandedProductId: number | null;
  onToggleProduct: (id: number) => void;
  selectedProductId: number | null;
  onSelectProduct: (id: number) => void;
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onNewProduct: () => void;
  onEditProduct: (id: number) => void;
  onNewProject: (productId: number) => void;
  onEditProject: (project: Project) => void;
}

function groupByCategory(products: Product[]): Group[] {
  const map = new Map<string, Group>();

  for (const p of products) {
    const key = p.category_name || '__none__';
    if (!map.has(key)) {
      const colorCfg = p.category_color ? CATEGORY_COLORS[p.category_color] : null;
      map.set(key, {
        key,
        label: p.category_name || 'Uncategorized',
        dot: colorCfg?.dot,
        border: colorCfg ? colorCfg.border : 'border-gray-300',
        header: colorCfg ? colorCfg.header : 'bg-gray-50',
        textClass: colorCfg ? colorCfg.text : 'text-gray-500',
        items: [],
      });
    }
    map.get(key)!.items.push(p);
  }

  return [...map.values()].sort((a, b) => {
    if (a.key === '__none__') return 1;
    if (b.key === '__none__') return -1;
    return a.label.localeCompare(b.label);
  });
}

function groupByStatus(products: Product[]): Group[] {
  const map = new Map<ProductStatus, Group>();

  for (const s of PRODUCT_STATUSES) {
    const cfg = PRODUCT_STATUS_CONFIG[s];
    map.set(s, {
      key: s,
      label: cfg.label,
      dot: cfg.dot,
      border: cfg.border,
      header: cfg.header,
      textClass: cfg.text,
      items: [],
    });
  }

  for (const p of products) {
    map.get(p.status)?.items.push(p);
  }

  return [...map.values()].filter(g => g.items.length > 0);
}

function groupByPriority(products: Product[]): Group[] {
  const ORDER: Priority[] = ['high', 'medium', 'low'];
  const map = new Map<Priority, Group>();

  for (const p of ORDER) {
    const cfg = PRIORITY_CONFIG[p];
    map.set(p, {
      key: p,
      label: cfg.label,
      dot: cfg.dot,
      border: cfg.border,
      header: cfg.header,
      textClass: cfg.text,
      items: [],
    });
  }

  for (const p of products) {
    map.get(p.priority)?.items.push(p);
  }

  return [...map.values()].filter(g => g.items.length > 0);
}

export function ProductList({
  filters,
  groupBy,
  expandedProductId,
  onToggleProduct,
  selectedProductId,
  onSelectProduct,
  selectedProjectId,
  onSelectProject,
  onNewProduct,
  onEditProduct,
  onNewProject,
  onEditProject,
}: ProductListProps) {
  const { data: products = [], isLoading } = useProducts(filters);

  const groups = useMemo(() => {
    if (groupBy === 'status') return groupByStatus(products);
    if (groupBy === 'priority') return groupByPriority(products);
    return groupByCategory(products);
  }, [products, groupBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Create your first product to get started."
        action={{ label: '+ New Product', onClick: onNewProduct }}
      />
    );
  }

  return (
    <div className="p-6 space-y-8">
      {groups.map(group => (
        <section key={group.key}>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-3 border-l-4 ${group.header} ${group.border}`}>
            {group.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${group.dot}`} />}
            <h2 className={`text-xs font-semibold uppercase tracking-wide ${group.textClass}`}>
              {group.label}
            </h2>
            <span className={`text-xs font-normal opacity-60 ${group.textClass}`}>
              ({group.items.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {group.items.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                isExpanded={expandedProductId === p.id}
                onToggle={() => onToggleProduct(p.id)}
                isSelected={selectedProductId === p.id}
                onSelect={onSelectProduct}
                selectedProjectId={selectedProjectId}
                onSelectProject={onSelectProject}
                onEditProduct={onEditProduct}
                onNewProject={onNewProject}
                onEditProject={onEditProject}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
