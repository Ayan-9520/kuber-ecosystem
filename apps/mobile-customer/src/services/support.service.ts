import { apiGet, apiGetPaginated, apiPost, apiPut } from '@/lib/api';

export const referralsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/referrals', params),
  create: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/referrals', data),
  validateCode: (referralCode: string) =>
    apiPost<Record<string, unknown>>('/referrals/validate-code', { referralCode }),
  types: () => apiGetPaginated<Record<string, unknown>>('/referral-types', { limit: 20 }),
};

export const notificationsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/notifications', params),
  markRead: (id: string) => apiPost<void>(`/notifications/${id}/read`),
  markAllRead: (userId: string) => apiPost<void>(`/notifications/users/${userId}/read-all`),
  communicationLogs: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/communication-logs', params),
  preferences: (userId: string) =>
    apiGetPaginated<Record<string, unknown>>('/notification-preferences', { userId, limit: 50 }),
  upsertPreference: (data: Record<string, unknown>) =>
    apiPut('/notification-preferences', data),
};

export const supportService = {
  tickets: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/tickets', params),
  getTicket: (id: string) => apiGet<Record<string, unknown>>(`/tickets/${id}`),
  createTicket: (data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>>('/tickets', data),
  timeline: (ticketId: string) =>
    apiGetPaginated<Record<string, unknown>>(`/tickets/${ticketId}/timeline`, { limit: 50 }),
  messages: (ticketId: string) =>
    apiGetPaginated<Record<string, unknown>>('/ticket-messages', { ticketId, limit: 100 }),
  sendMessage: (data: { ticketId: string; body: string }) =>
    apiPost<Record<string, unknown>>('/ticket-messages', { ...data, messageType: 'CUSTOMER' }),
  attachments: (ticketId: string) =>
    apiGet<Record<string, unknown>[]>(`/tickets/${ticketId}/attachments`),
  addAttachment: (ticketId: string, data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>>(`/tickets/${ticketId}/attachments`, data),
  categories: () => apiGetPaginated<Record<string, unknown>>('/ticket-categories', { limit: 50 }),
  rateTicket: (ticketId: string, data: { rating: number; comment?: string }) =>
    apiPost<Record<string, unknown>>(`/tickets/${ticketId}/close`, {
      reason: `CSAT ${data.rating}/5${data.comment ? `: ${data.comment}` : ''}`,
    }),
};
