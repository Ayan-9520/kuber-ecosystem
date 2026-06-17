import { apiGet, apiGetPaginated, apiPatch, apiPost, apiPut } from '@/lib/api';

export const emailService = {
  send: (data: unknown) => apiPost('/email/send', data),
  analytics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/email/analytics', params),
  templates: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/email/templates', params ?? {}),
  getTemplate: (id: string) => apiGet<Record<string, unknown>>(`/email/templates/${id}`),
  createTemplate: (data: unknown) => apiPost('/email/templates', data),
  updateTemplate: (id: string, data: unknown) => apiPatch(`/email/templates/${id}`, data),
  previewTemplate: (data: unknown) => apiPost<Record<string, unknown>>('/email/templates/preview', data),
  logs: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/email/logs', params ?? {}),
  getLog: (id: string) => apiGet<Record<string, unknown>>(`/email/logs/${id}`),
  providers: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/email/providers', params ?? {}),
  updateProvider: (id: string, data: unknown) => apiPatch(`/email/providers/${id}`, data),
  preferences: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/email/preferences', params ?? {}),
  upsertPreference: (data: unknown) => apiPut('/email/preferences', data),
  queue: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/email/queue', params ?? {}),
  processQueue: () => apiPost('/email/process-queue'),
};
