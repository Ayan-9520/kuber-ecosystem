import { apiGetPaginated } from '@/lib/api';

export const productsService = {
  list: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/products', params ?? { limit: 50 }),
};
