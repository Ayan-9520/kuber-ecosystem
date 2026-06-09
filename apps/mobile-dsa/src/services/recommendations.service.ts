import { apiGet } from '@/lib/api';

export const recommendationsService = {
  forLead: (leadId: string) => apiGet<Record<string, unknown>>(`/recommendations/lead/${leadId}`),
  forApplication: (applicationId: string) => apiGet<Record<string, unknown>>(`/recommendations/application/${applicationId}`),
  lenderMatches: (entityId: string, entityType = 'LEAD') =>
    apiGet<Record<string, unknown>>(`/recommendations/lender/${entityId}`, { entityType }),
  actions: (entityType: string, entityId: string) =>
    apiGet<Record<string, unknown>>('/recommendations/actions', { entityType, entityId }),
};
