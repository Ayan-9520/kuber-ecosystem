import { apiDelete, apiDownload, apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const automationService = {
  workflows: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/automation/workflows', params),
  workflow: (id: string) => apiGet<Record<string, unknown>>(`/automation/workflows/${id}`),
  createWorkflow: (data: unknown) => apiPost('/automation/workflows', data),
  updateWorkflow: (id: string, data: unknown) => apiPatch(`/automation/workflows/${id}`, data),
  approveWorkflow: (id: string) => apiPost(`/automation/workflows/${id}/approve`),
  deleteWorkflow: (id: string) => apiDelete(`/automation/workflows/${id}`),

  templates: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/automation/templates', params),
  template: (id: string) => apiGet<Record<string, unknown>>(`/automation/templates/${id}`),
  useTemplate: (id: string) => apiPost(`/automation/templates/${id}/use`),

  executions: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/automation/executions', params),
  execution: (id: string) => apiGet<Record<string, unknown>>(`/automation/executions/${id}`),
  cancelExecution: (id: string) => apiPost(`/automation/executions/${id}/cancel`),
  retryExecution: (id: string) => apiPost(`/automation/executions/${id}/retry`),

  triggers: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/automation/triggers', params),
  createTrigger: (data: unknown) => apiPost('/automation/triggers', data),
  updateTrigger: (id: string, data: unknown) => apiPatch(`/automation/triggers/${id}`, data),

  analyticsDashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/automation/analytics/dashboard', params),
  analytics: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/automation/analytics', params),

  logs: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/automation/logs', params),

  export: (params: Record<string, unknown>) => apiDownload('/automation/export', params),

  aiSuggest: (data: unknown) => apiPost<Record<string, unknown>>('/automation/ai/suggest', data),
};
