import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const whatsappService = {
  send: (data: unknown) => apiPost('/whatsapp/send', data),
  logs: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/whatsapp', params ?? {}),
  getLog: (id: string) => apiGet<Record<string, unknown>>(`/whatsapp/${id}`),
  analytics: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/communication-logs/analytics', { ...params, channel: 'WHATSAPP' }),
  templates: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/notification-templates', { ...params, channel: 'WHATSAPP' }),
  providers: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/communication-providers', { ...params, channel: 'WHATSAPP' }),
};
