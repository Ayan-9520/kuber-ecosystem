import { apiGetPaginated, apiPost } from '@/lib/api';

export const notificationsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/notifications', params),
  markRead: (id: string) => apiPost<void>(`/notifications/${id}/read`),
  markAllRead: (userId: string) => apiPost<void>(`/notifications/users/${userId}/read-all`),
  sms: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms', params),
  whatsapp: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/whatsapp', params),
  communicationLogs: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/communication-logs', params),
};
