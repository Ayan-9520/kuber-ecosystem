import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const productsService = {
  list: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/products', { limit: 50, isActive: true, ...params }),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/products/${id}`),
  recommend: (data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>[]>('/products/recommend', data),
  variants: (productId?: string) =>
    apiGetPaginated<Record<string, unknown>>('/product-variants', {
      limit: 50,
      isActive: true,
      ...(productId ? { productId } : {}),
    }),
  documentTypes: () => apiGetPaginated<Record<string, unknown>>('/document-types', { limit: 100 }),
};

export const eligibilityService = {
  calculate: (data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>>('/eligibility/calculate', data),
  results: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/eligibility-results', params),
};

export const emiService = {
  calculate: (data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>>('/emi/calculate', data),
};

export const aiService = {
  productRecommendations: (data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>[]>('/finance-ai/product-recommendations', data),
  lenderRecommendations: (data: Record<string, unknown>) =>
    apiPost<Record<string, unknown>[]>('/finance-ai/lender-recommendations', data),
};
