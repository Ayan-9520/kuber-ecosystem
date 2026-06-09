import { apiGet } from '@/lib/api';

export interface RecommendationBundle {
  entityType: string;
  entityId: string;
  sessionId: string;
  products: Array<{
    productName: string;
    rankScore: number;
    approvalProbability: number;
    recommendedAmount?: number;
    recommendedEmi?: number;
    reason: string;
  }>;
  lenders: Array<{
    lenderName: string;
    rankScore: number;
    approvalProbability: number;
    expectedTatDays?: number;
    estimatedEmi?: number;
    reason: string;
  }>;
  crossSell: Array<{ label: string; description: string; matchScore: number }>;
  actions: Array<{ title: string; description: string; priority: number; actionType: string }>;
  documents: { required: string[]; missing: string[]; risk: string[] };
  risk: { riskLevel: string; explanations: string[]; mitigations: string[] };
  approvalProbability: number;
  disbursalProbability: number;
  recommendedEmi?: number;
  generatedAt: string;
}

export const recommendationsService = {
  forCustomer: (id: string) => apiGet<RecommendationBundle>(`/recommendations/customer/${id}`),
  forLead: (id: string) => apiGet<RecommendationBundle>(`/recommendations/lead/${id}`),
  forApplication: (id: string) => apiGet<RecommendationBundle>(`/recommendations/application/${id}`),
  lenderMatches: (id: string, entityType = 'LEAD') =>
    apiGet<{ lenders: RecommendationBundle['lenders']; approvalProbability: number }>(`/recommendations/lender/${id}`, { entityType }),
  crossSell: (entityType: string, entityId: string) =>
    apiGet<{ crossSell: RecommendationBundle['crossSell'] }>('/recommendations/cross-sell', { entityType, entityId }),
  actions: (entityType: string, entityId: string) =>
    apiGet<{ actions: RecommendationBundle['actions']; risk: RecommendationBundle['risk'] }>('/recommendations/actions', { entityType, entityId }),
  analytics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/recommendations/analytics', params),
};
