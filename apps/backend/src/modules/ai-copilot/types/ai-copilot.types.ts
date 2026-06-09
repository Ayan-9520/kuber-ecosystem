import type {
  AiActionType,
  AiCopilotEntityType,
  AiInsightCategory,
  AiPredictionType,
  AiRecommendationType,
  AiRiskSeverity,
} from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface CopilotLeadAnalysis {
  leadId: string;
  leadGrade: string | null;
  approvalProbability: number;
  disbursalProbability: number;
  conversionProbability: number;
  riskRating?: string;
  priorityLevel?: string;
  classification?: string;
  riskFlags: CopilotRiskFlag[];
  recommendedProduct: CopilotRecommendation | null;
  recommendedLender: CopilotRecommendation | null;
  recommendedExecutive: CopilotRecommendation | null;
  nextBestActions: CopilotAction[];
  crossSellOpportunities: CopilotCrossSell[];
  insights: CopilotInsight[];
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
  riskFlags: CopilotRiskFlag[];
  nextBestActions: CopilotAction[];
  crossSellOpportunities: CopilotCrossSell[];
  insights: CopilotInsight[];
  sessionId: string;
}

export interface CopilotRiskFlag {
  code: string;
  label: string;
  severity: AiRiskSeverity;
  description?: string;
}

export interface CopilotRecommendation {
  type: AiRecommendationType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  priority: number;
}

export interface CopilotAction {
  actionType: AiActionType;
  title: string;
  description: string;
  priority: number;
  dueAt?: string;
}

export interface CopilotCrossSell {
  code: string;
  label: string;
  description: string;
  score: number;
}

export interface CopilotInsight {
  category: AiInsightCategory;
  title: string;
  summary: string;
  confidence: number;
  details?: Record<string, unknown>;
}

export interface CopilotEntitySummary {
  entityType: AiCopilotEntityType;
  entityId: string;
  title: string;
  insights: CopilotInsight[];
  recommendations: CopilotRecommendation[];
  predictions: Array<{ type: AiPredictionType; probability: number; grade?: string }>;
  riskFlags: CopilotRiskFlag[];
  nextBestActions: CopilotAction[];
  crossSellOpportunities: CopilotCrossSell[];
  sessionId: string;
}

export interface CopilotAnalyticsSummary {
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
