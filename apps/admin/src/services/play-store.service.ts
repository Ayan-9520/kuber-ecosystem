import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const playStoreService = {
  dashboard: () => apiGet<Record<string, unknown>>('/play-store/dashboard'),
  checklist: () => apiGet<Record<string, unknown>>('/play-store/checklist'),
  reports: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/play-store/reports', params),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/play-store/releases', params),
  createRelease: (data: unknown) => apiPost('/play-store/releases', data),
};
