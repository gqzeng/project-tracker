import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Project, ProjectWithProduct } from '../types';
import { productKeys } from './products';

export const projectKeys = {
  all: ['projects'] as const,
  allList: () => [...projectKeys.all, 'all-list'] as const,
  byProduct: (productId: number) => [...projectKeys.all, 'product', productId] as const,
  detail: (id: number) => [...projectKeys.all, 'detail', id] as const,
};

export function useAllProjects() {
  return useQuery({
    queryKey: projectKeys.allList(),
    queryFn: () => apiClient.get<ProjectWithProduct[]>('/api/projects').then(r => r.data),
  });
}

export function useProjects(productId: number) {
  return useQuery({
    queryKey: projectKeys.byProduct(productId),
    queryFn: () =>
      apiClient.get<Project[]>(`/api/products/${productId}/projects`).then(r => r.data),
    enabled: productId > 0,
  });
}

export function useProject(id: number | null) {
  return useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () =>
      apiClient.get<Project>(`/api/projects/${id}`).then(r => r.data),
    enabled: id !== null,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...payload }: { productId: number } & Partial<Project>) =>
      apiClient
        .post<Project>(`/api/products/${productId}/projects`, payload)
        .then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: projectKeys.byProduct(data.product_id) });
      qc.invalidateQueries({ queryKey: projectKeys.allList() });
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<Project>) =>
      apiClient.put<Project>(`/api/projects/${id}`, payload).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: projectKeys.byProduct(data.product_id) });
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
