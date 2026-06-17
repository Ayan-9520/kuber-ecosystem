import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const devopsService = {
  dashboard: () => apiGet<Record<string, unknown>>('/devops/dashboard'),
  pipelines: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/devops/pipelines', params),
  pipeline: (id: string) => apiGet<Record<string, unknown>>(`/devops/pipelines/${id}`),
  deployments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/devops/deployments', params),
  deployment: (id: string) => apiGet<Record<string, unknown>>(`/devops/deployments/${id}`),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/devops/releases', params),
  createRelease: (data: unknown) => apiPost('/devops/releases', data),
  publishRelease: (id: string) => apiPost(`/devops/releases/${id}/publish`, {}),
  rollbacks: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/devops/rollbacks', params),
  createRollback: (data: unknown) => apiPost('/devops/rollbacks', data),
  history: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/devops/history', params),
};
