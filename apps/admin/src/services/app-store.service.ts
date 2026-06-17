import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const appStoreService = {
  dashboard: () => apiGet<Record<string, unknown>>('/app-store/dashboard'),
  testflight: () => apiGet<Record<string, unknown>>('/app-store/testflight'),
  checklist: () => apiGet<Record<string, unknown>>('/app-store/checklist'),
  reports: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/app-store/reports', params),
  releases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/app-store/releases', params),
  createRelease: (data: unknown) => apiPost('/app-store/releases', data),
};
