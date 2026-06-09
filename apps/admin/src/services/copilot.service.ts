import { apiGet, apiPost } from '@/lib/api';

export interface CopilotLeadAnalysis {
  leadId: string;
  leadGrade: string | null;
  approvalProbability: number;
  disbursalProbability: number;
  conversionProbability: number;
  riskRating?: string;
  priorityLevel?: string;
  classification?: string;
  riskFlags: Array<{ code: string; label: string; severity: string; description?: string }>;
  recommendedProduct: { title: string; description: string } | null;
  recommendedLender: { title: string; description: string } | null;
  recommendedExecutive: { title: string; description: string } | null;
  nextBestActions: Array<{ actionType: string; title: string; description: string; priority: number }>;
  crossSellOpportunities: Array<{ code: string; label: string; description: string; score: number }>;
  insights: Array<{ category: string; title: string; summary: string; confidence: number }>;
  sessionId: string;
}

export interface CopilotApplicationAnalysis {
  applicationId: string;
  successProbability: number;
  delayRisk: number;
  approvalProbability: number;
  disbursalProbability: number;
  missingInformation: string[];
  escalationRequired: boolean;
  riskFlags: Array<{ code: string; label: string; severity: string }>;
  nextBestActions: Array<{ actionType: string; title: string; description: string; priority: number }>;
  crossSellOpportunities: Array<{ code: string; label: string; score: number }>;
  insights: Array<{ category: string; title: string; summary: string; confidence: number }>;
  sessionId: string;
}

export interface CopilotAnalytics {
  totalSessions: number;
  totalInsights: number;
  totalRecommendations: number;
  recommendationAcceptanceRate: number;
  predictionAccuracyRate: number;
  approvalAccuracyRate: number;
  disbursalAccuracyRate: number;
  conversionRate: number;
  usageByEntityType: Record<string, number>;
}

export const copilotService = {
  analyzeLead: (id: string) => apiGet<CopilotLeadAnalysis>(`/ai-copilot/lead/${id}`),

  analyzeApplication: (id: string) => apiGet<CopilotApplicationAnalysis>(`/ai-copilot/application/${id}`),

  analyzeCustomer: (id: string) => apiGet<Record<string, unknown>>(`/ai-copilot/customer/${id}`),

  analyzeExecutive: (id: string) => apiGet<Record<string, unknown>>(`/ai-copilot/executive/${id}`),

  analyzeBranch: (id: string) => apiGet<Record<string, unknown>>(`/ai-copilot/branch/${id}`),

  insights: (params?: Record<string, unknown>) => apiGet<unknown[]>('/ai-copilot/insights', params),

  recommendations: (params?: Record<string, unknown>) =>
    apiGet<unknown[]>('/ai-copilot/recommendations', params),

  analytics: (params?: Record<string, unknown>) => apiGet<CopilotAnalytics>('/ai-copilot/analytics', params),

  feedback: (body: {
    sessionId?: string;
    entityType?: string;
    entityId?: string;
    rating: 'HELPFUL' | 'PARTIAL' | 'NOT_HELPFUL';
    comment?: string;
  }) => apiPost('/ai-copilot/feedback', body),
};
