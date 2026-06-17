import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const errorTrackingService = {
  overview: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/errors/analytics', params),
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/errors', params),
  groups: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/errors/groups', params),
  getById: (id: string) =>
    apiGet<Record<string, unknown>>(`/errors/${id}`),
  alerts: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/errors/alerts', params),
  assignments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/errors/assignments', params),
  assign: (data: unknown) => apiPost('/errors/assign', data),
  resolve: (data: unknown) => apiPost('/errors/resolve', data),
  capture: (data: unknown) => apiPost('/errors', data),
  deploymentGate: () => apiGet<Record<string, unknown>>('/errors/deployment-gate'),
};
