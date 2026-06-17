import { apiGet, apiGetPaginated } from '@/lib/api';

export const observabilityService = {
  overview: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/observability/overview', params),
  ai: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/observability/ai', params),
  logs: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/observability/logs', params),
  traces: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/observability/traces', params),
  errors: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/observability/errors', params),
  events: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/observability/events', params),
  search: (params: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/observability/search', params),
  getTrace: (traceId: string) =>
    apiGet<Record<string, unknown>>(`/observability/traces/${traceId}`),
  getError: (id: string) =>
    apiGet<Record<string, unknown>>(`/observability/errors/${id}`),
};
