import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const stagingService = {
  dashboard: () => apiGet<Record<string, unknown>>('/staging/dashboard'),
  status: () => apiGet<Record<string, unknown>>('/staging/status'),
  health: () => apiGet<Record<string, unknown>>('/staging/health'),
  deployments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/staging/deployments', params),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/staging/releases', params),
  createRelease: (data: unknown) => apiPost('/staging/releases', data),
  reports: () => apiGet<Record<string, unknown>>('/staging/reports'),
};
