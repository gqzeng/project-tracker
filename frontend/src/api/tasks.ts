import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Task, TaskStatus, Priority, TaskWithContext } from '../types';
import { projectKeys } from './projects';
import { productKeys } from './products';

export const taskKeys = {
  all: ['tasks'] as const,
  allList: () => [...taskKeys.all, 'all-list'] as const,
};

export function useAllTasks() {
  return useQuery({
    queryKey: taskKeys.allList(),
    queryFn: () => apiClient.get<TaskWithContext[]>('/api/tasks').then(r => r.data),
  });
}

export function useCreateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; status?: TaskStatus; priority?: Priority }) =>
      apiClient
        .post<Task>(`/api/projects/${projectId}/tasks`, payload)
        .then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number;
      title?: string;
      status?: TaskStatus;
      priority?: Priority;
      sort_order?: number;
    }) => apiClient.put<Task>(`/api/tasks/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
