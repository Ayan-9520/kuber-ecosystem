import { apiGet, apiGetPaginated, apiPatch } from '@/lib/api';

export const monitoringService = {
  overview: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/overview', params),
  system: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/system', params),
  application: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/application', params),
  database: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/database', params),
  queues: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/queues', params),
  ai: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/ai', params),
  notifications: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/notifications', params),
  business: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/business', params),
  sla: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/monitoring/sla', params),
  deploymentReadiness: () => apiGet<Record<string, unknown>>('/monitoring/deployment-readiness'),
  alerts: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/monitoring/alerts', params),
  alertsSummary: () => apiGet<Record<string, unknown>>('/monitoring/alerts/summary'),
  updateAlert: (id: string, data: unknown) => apiPatch(`/monitoring/alerts/${id}`, data),
};
