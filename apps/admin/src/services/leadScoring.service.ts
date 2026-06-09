import { apiGet, apiPost } from '@/lib/api';

export interface LeadScoreResult {
  id: string;
  leadId: string;
  score: number;
  grade: string;
  gradeAlias?: string;
  classification?: string;
  approvalProbability: number;
  disbursalProbability: number;
  conversionProbability: number;
  riskRating?: string;
  priorityLevel?: string;
  riskIndicators?: string[];
  factorBreakdown?: Record<string, { score: number; weight: number; weighted: number }>;
  predictions?: Record<string, number>;
  modelVersion: string;
  calculatedAt: string;
}

export interface LeadScoringAnalytics {
  totalScored: number;
  gradeDistribution: Record<string, number>;
  riskDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  averageScore: number;
  averageApprovalProbability: number;
  averageDisbursalProbability: number;
  conversionRate: number;
  predictionAccuracy: number;
}

export const leadScoringService = {
  calculate: (leadId: string, force = false) =>
    apiGet<LeadScoreResult>(`/lead-scoring/calculate/${leadId}`, { force }),

  bulkCalculate: (leadIds: string[]) => apiPost('/lead-scoring/bulk-calculate', { leadIds }),

  history: (leadId: string) =>
    apiGet<{
      history: Array<Record<string, unknown>>;
      latestScore: LeadScoreResult | null;
      riskProfile: Record<string, unknown> | null;
      predictions: Array<Record<string, unknown>>;
    }>(`/lead-scoring/history/${leadId}`),

  analytics: (params?: Record<string, unknown>) => apiGet<LeadScoringAnalytics>('/lead-scoring/analytics', params),

  rules: (params?: Record<string, unknown>) => apiGet<{ items: unknown[]; meta: Record<string, unknown> }>('/lead-scoring/rules', params),

  weights: (params?: Record<string, unknown>) => apiGet<{ items: unknown[]; meta: Record<string, unknown> }>('/lead-scoring/weights', params),
};
