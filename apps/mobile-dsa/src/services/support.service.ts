import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const supportService = {
  tickets: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/tickets', params),
  getTicket: (id: string) => apiGet<Record<string, unknown>>(`/tickets/${id}`),
  createTicket: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/tickets', data),
  updateTicket: (id: string, data: Record<string, unknown>) =>
    apiPatch<Record<string, unknown>>(`/tickets/${id}`, data),
  timeline: (id: string, params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>(`/tickets/${id}/timeline`, params),
  messages: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/ticket-messages', params),
  sendMessage: (data: { ticketId: string; body: string }) =>
    apiPost<Record<string, unknown>>('/ticket-messages', { ...data, messageType: 'CUSTOMER' }),
  attachments: (ticketId: string) =>
    apiGet<Record<string, unknown>[]>(`/tickets/${ticketId}/attachments`),
  addAttachment: (ticketId: string, data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>>(`/tickets/${ticketId}/attachments`, data),
  escalations: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/ticket-escalations', params),
  categories: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/ticket-categories', params ?? {}),
  rateTicket: (ticketId: string, data: { rating: number; comment?: string }) =>
    apiPost<Record<string, unknown>>(`/tickets/${ticketId}/close`, {
      reason: `CSAT ${data.rating}/5${data.comment ? `: ${data.comment}` : ''}`,
    }),
};
