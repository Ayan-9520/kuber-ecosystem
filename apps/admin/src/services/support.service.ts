import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const supportService = {
  tickets: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/tickets', params),
  getTicket: (id: string) => apiGet<Record<string, unknown>>(`/tickets/${id}`),
  createTicket: (data: unknown) => apiPost('/tickets', data),
  updateTicket: (id: string, data: unknown) => apiPatch(`/tickets/${id}`, data),
  assignTicket: (id: string, data: unknown) => apiPost(`/tickets/${id}/assign`, data),
  escalateTicket: (id: string, data: unknown) => apiPost(`/tickets/${id}/escalate`, data),
  resolveTicket: (id: string, data: unknown) => apiPost(`/tickets/${id}/resolve`, data),
  closeTicket: (id: string, data: unknown) => apiPost(`/tickets/${id}/close`, data),
  rejectTicket: (id: string, data: unknown) => apiPost(`/tickets/${id}/reject`, data),
  timeline: (id: string, params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>(`/tickets/${id}/timeline`, params),
  attachments: (id: string) => apiGet<Record<string, unknown>[]>(`/tickets/${id}/attachments`),
  addAttachment: (id: string, data: unknown) => apiPost(`/tickets/${id}/attachments`, data),
  messages: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/ticket-messages', params),
  sendMessage: (data: unknown) => apiPost('/ticket-messages', data),
  assignments: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/ticket-assignments', params),
  escalations: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/ticket-escalations', params),
  resolutions: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/ticket-resolutions', params),
  categories: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/ticket-categories', params ?? {}),
  analytics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/ticket-analytics', params),
};
