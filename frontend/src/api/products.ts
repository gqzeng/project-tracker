import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Product, ProductFilters } from '../types';

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

function buildParams(filters?: ProductFilters) {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.status) params.status = filters.status;
  if (filters.category_id) params.category_id = String(filters.category_id);
  if (filters.priority) params.priority = filters.priority;
  if (filters.q) params.q = filters.q;
  if (filters.sort) params.sort = filters.sort;
  if (filters.order) params.order = filters.order;
  return params;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () =>
      apiClient.get<Product[]>('/api/products', { params: buildParams(filters) }).then(r => r.data),
  });
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () =>
      apiClient.get<Product>(`/api/products/${id}`).then(r => r.data),
    enabled: id !== null,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Product>) =>
      apiClient.post<Product>('/api/products', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<Product>) =>
      apiClient.put<Product>(`/api/products/${id}`, payload).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
