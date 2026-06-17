import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const productionService = {
  dashboard: () => apiGet<Record<string, unknown>>('/production/dashboard'),
  status: () => apiGet<Record<string, unknown>>('/production/status'),
  health: () => apiGet<Record<string, unknown>>('/production/health'),
  goLiveGates: () => apiGet<Record<string, unknown>>('/production/go-live-gates'),
  deployments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/production/deployments', params),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/production/releases', params),
  createRelease: (data: unknown) => apiPost('/production/releases', data),
  incidents: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/production/incidents', params),
  createIncident: (data: unknown) => apiPost('/production/incidents', data),
  reports: () => apiGet<Record<string, unknown>>('/production/reports'),
};
