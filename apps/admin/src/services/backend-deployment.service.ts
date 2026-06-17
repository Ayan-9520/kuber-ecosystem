import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const backendDeploymentService = {
  status: () => apiGet<Record<string, unknown>>('/deployment/status'),
  health: () => apiGet<Record<string, unknown>>('/deployment/health'),
  services: () => apiGet<Record<string, unknown>>('/deployment/services'),
  dashboard: () => apiGet<Record<string, unknown>>('/deployment/dashboard'),
  reports: () => apiGet<Record<string, unknown>>('/deployment/reports'),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/deployment/releases', params),
  deployments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/deployment/deployments', params),
  createDeployment: (data: unknown) => apiPost('/deployment/deployments', data),
  createRelease: (data: unknown) => apiPost('/deployment/releases', data),
};
