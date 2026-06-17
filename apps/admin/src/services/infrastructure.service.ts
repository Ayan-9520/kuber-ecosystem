import { apiGet, apiGetPaginated } from '@/lib/api';

export const infrastructureService = {
  overview: () => apiGet<Record<string, unknown>>('/infrastructure/overview'),
  environments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/infrastructure/environments', params),
  environment: (code: string) => apiGet<Record<string, unknown>>(`/infrastructure/environments/${code}`),
  services: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/infrastructure/services', params),
  domains: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/infrastructure/domains', params),
  healthHistory: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/infrastructure/health-history', params),
  configs: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>[]>('/infrastructure/configs', params),
  deployment: () => apiGet<Record<string, unknown>>('/infrastructure/deployment'),
};
