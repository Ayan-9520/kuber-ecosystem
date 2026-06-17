import { apiGet, apiPost } from '@/lib/api';

export const drService = {
  status: () => apiGet<Record<string, unknown>>('/dr/status'),
  dashboard: () => apiGet<Record<string, unknown>>('/dr/dashboard'),
  plans: () => apiGet<Record<string, unknown>>('/dr/plans'),
  drills: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/dr/drills', params),
  startDrill: (data: unknown) => apiPost('/dr/drills', data),
  failover: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/dr/failover', params),
  startFailover: (data: unknown) => apiPost('/dr/failover', data),
  recovery: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/dr/recovery', params),
  startRecovery: (data: unknown) => apiPost('/dr/recovery', data),
  reports: () => apiGet<Record<string, unknown>>('/dr/reports'),
};
