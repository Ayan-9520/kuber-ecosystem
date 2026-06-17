import { apiGet, apiGetPaginated, apiPatch, apiPost, apiPut } from '@/lib/api';

export const smsService = {
  send: (data: unknown) => apiPost('/sms/send', data),
  analytics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/sms/analytics', params),
  templates: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms/templates', params ?? {}),
  getTemplate: (id: string) => apiGet<Record<string, unknown>>(`/sms/templates/${id}`),
  createTemplate: (data: unknown) => apiPost('/sms/templates', data),
  updateTemplate: (id: string, data: unknown) => apiPatch(`/sms/templates/${id}`, data),
  previewTemplate: (data: unknown) => apiPost<Record<string, unknown>>('/sms/templates/preview', data),
  logs: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms/logs', params ?? {}),
  getLog: (id: string) => apiGet<Record<string, unknown>>(`/sms/logs/${id}`),
  providers: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms/providers', params ?? {}),
  updateProvider: (id: string, data: unknown) => apiPatch(`/sms/providers/${id}`, data),
  preferences: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms/preferences', params ?? {}),
  upsertPreference: (data: unknown) => apiPut('/sms/preferences', data),
  queue: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms/queue', params ?? {}),
  processQueue: () => apiPost('/sms/process-queue'),
};
