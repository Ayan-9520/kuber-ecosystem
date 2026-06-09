import type { LeadGrade, LeadRiskRating, LeadScorePriority } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ScoringFactorBreakdown {
  score: number;
  weight: number;
  weighted: number;
}

export interface LeadScoringProfile {
  monthlyIncome?: number;
  annualIncome?: number;
  propertyValue?: number;
  vehicleValue?: number;
  businessTurnover?: number;
  businessVintageYears?: number;
  loanAmount?: number;
  existingObligations?: number;
  location?: string;
  occupation?: string;
  employmentType?: string;
  productType?: string;
  creditScore?: number;
  documentCompletenessPct?: number;
  bankingBehaviourScore?: number;
  partnerQualityScore?: number;
  leadSourceChannel?: string;
  referralSource?: string;
  applicationStage?: string;
  leadStatus?: string;
  foir?: number;
  ltv?: number;
  dscr?: number;
}

export interface LeadScoringEngineResult {
  score: number;
  grade: LeadGrade;
  classification: string;
  ruleScore: number;
  aiScore: number;
  approvalProbability: number;
  disbursalProbability: number;
  conversionProbability: number;
  riskRating: LeadRiskRating;
  priorityLevel: LeadScorePriority;
  riskIndicators: string[];
  riskFactors: Record<string, number>;
  factorBreakdown: Record<string, ScoringFactorBreakdown>;
  predictions: {
    approval: number;
    disbursal: number;
    conversion: number;
    dropOff: number;
    document: number;
    fraud: number;
  };
  modelVersion: string;
  weightVersion: string;
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
