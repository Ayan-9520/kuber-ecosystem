import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const contentService = {
  generate: (data: unknown) => apiPost('/content/generate', data),
  rewrite: (data: unknown) => apiPost('/content/rewrite', data),
  summarize: (data: unknown) => apiPost('/content/summarize', data),
  translate: (data: unknown) => apiPost('/content/translate', data),

  templates: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/content/templates', params),
  template: (id: string) => apiGet<Record<string, unknown>>(`/content/templates/${id}`),
  createTemplate: (data: unknown) => apiPost('/content/templates', data),
  updateTemplate: (id: string, data: unknown) => apiPatch(`/content/templates/${id}`, data),

  history: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/content/history', params),
  historyItem: (id: string) => apiGet<Record<string, unknown>>(`/content/history/${id}`),
  submitReview: (id: string) => apiPost(`/content/history/${id}/review`),

  approvals: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/content/approvals', params ?? {}),
  approve: (data: unknown) => apiPost('/content/approve', data),
  reject: (data: unknown) => apiPost('/content/reject', data),
  publish: (data: unknown) => apiPost('/content/publish', data),

  feedback: (data: unknown) => apiPost('/content/feedback', data),

  analyticsDashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/content/analytics/dashboard', params),
  analytics: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/content/analytics', params),
};
