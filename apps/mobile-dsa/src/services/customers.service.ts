import { apiGet, apiGetPaginated } from '@/lib/api';

export const customersService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/customers', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/customers/${id}`),
  profile: (customerId: string) =>
    apiGet<Record<string, unknown>>('/customer-profiles', { customerId }),
  applications: (customerId: string) =>
    apiGetPaginated<Record<string, unknown>>('/applications', {
      customerId,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
};
