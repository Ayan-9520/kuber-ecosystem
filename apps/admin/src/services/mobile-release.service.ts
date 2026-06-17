import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const mobileReleaseService = {
  dashboard: () => apiGet<Record<string, unknown>>('/mobile/dashboard'),
  checklist: () => apiGet<Record<string, unknown>>('/mobile/checklist'),
  builds: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/mobile/builds', params),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/mobile/releases', params),
  createRelease: (data: unknown) => apiPost('/mobile/releases', data),
  getBuild: (id: string) => apiGet<Record<string, unknown>>(`/mobile/builds/${id}`),
  getRelease: (id: string) => apiGet<Record<string, unknown>>(`/mobile/releases/${id}`),
};
