import { apiGet, apiGetPaginated } from '@/lib/api';

export const partnersService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/partners', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/partners/${id}`),
};
