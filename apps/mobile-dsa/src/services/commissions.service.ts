import { apiGet, apiGetPaginated } from '@/lib/api';

export const commissionsService = {
  ledger: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-ledger', params),
  payments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-payments', params),
  recoveries: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-recoveries', params),
  adjustments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-adjustments', params),
  analytics: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/commission-analytics', params),
};
