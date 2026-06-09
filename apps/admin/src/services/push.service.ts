import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const pushService = {
  send: (data: unknown) => apiPost('/push/send', data),
  analytics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/push/analytics', params),
  templates: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/templates', params ?? {}),
  logs: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/logs', params ?? {}),
  providers: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/providers', params ?? {}),
  topics: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/topics', params ?? {}),
  preferences: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/preferences', params ?? {}),
  queue: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/queue', params ?? {}),
  processQueue: () => apiPost('/push/process-queue'),
};
