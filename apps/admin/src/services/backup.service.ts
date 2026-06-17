import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const backupService = {
  overview: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/backups', params),
  jobs: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/backups/jobs', params),
  history: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/backups/history', params),
  retention: () => apiGet<Record<string, unknown>[]>('/backups/retention'),
  trigger: (data: unknown) => apiPost('/backups', data),
  restore: (data: unknown) => apiPost('/backups/restore', data),
  restores: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/backups/restore', params),
  drOverview: () => apiGet<Record<string, unknown>>('/disaster-recovery'),
  drPlans: () => apiGet<Record<string, unknown>[]>('/disaster-recovery/plans'),
  drDrills: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/disaster-recovery/drills', params),
  startDrill: (data: unknown) => apiPost('/disaster-recovery/drills', data),
};
