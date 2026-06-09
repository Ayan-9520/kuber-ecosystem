import { apiGet } from '@/lib/api';

export const recommendationsService = {
  forCustomer: (customerId: string) => apiGet<Record<string, unknown>>(`/recommendations/customer/${customerId}`),
  lenderMatches: (entityId: string, entityType = 'CUSTOMER') =>
    apiGet<Record<string, unknown>>(`/recommendations/lender/${entityId}`, { entityType }),
  crossSell: (entityType: string, entityId: string) =>
    apiGet<Record<string, unknown>>('/recommendations/cross-sell', { entityType, entityId }),
};
