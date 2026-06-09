import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const referralsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/referrals', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/referrals/${id}`),
  create: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/referrals', data),
  types: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/referral-types', params ?? {}),
  analytics: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/referral-analytics', params),
};
