import type { RecommendationEntityType, RecommendationRiskLevel } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface CustomerProfile {
  customerId: string;
  monthlyIncome?: number;
  creditScore?: number;
  age?: number;
  occupation?: string;
  employmentType?: string;
  businessVintageYears?: number;
  businessTurnover?: number;
  location?: string;
  propertyValue?: number;
  vehicleValue?: number;
  loanAmount?: number;
  existingObligations?: number;
  foir?: number;
  ltv?: number;
  dscr?: number;
  leadScore?: number;
  leadGrade?: string;
  applicationStatus?: string;
  productId?: string;
  productType?: string;
  documentCompletenessPct?: number;
}

export interface LenderMatchResult {
  lenderId: string;
  lenderName: string;
  rankScore: number;
  rankPosition: number;
  approvalProbability: number;
  expectedRoi?: number;
  expectedTatDays?: number;
  estimatedEmi?: number;
  reason: string;
}

export interface ProductMatchResult {
  productId?: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  rankScore: number;
  rankPosition: number;
  recommendedAmount?: number;
  recommendedTenure?: number;
  recommendedEmi?: number;
  approvalProbability: number;
  reason: string;
}

export interface CrossSellResult {
  productCode: string;
  label: string;
  description: string;
  matchScore: number;
  rankPosition: number;
}

export interface ActionResult {
  actionType: string;
  title: string;
  description: string;
  priority: number;
  dueAt?: string;
}

export interface DocumentRecResult {
  required: string[];
  additional: string[];
  risk: string[];
  missing: string[];
  weak: string[];
  expired: string[];
}

export interface RiskRecResult {
  riskLevel: RecommendationRiskLevel;
  riskScore: number;
  explanations: string[];
  mitigations: string[];
}

export interface RecommendationBundle {
  entityType: RecommendationEntityType;
  entityId: string;
  sessionId: string;
  products: ProductMatchResult[];
  lenders: LenderMatchResult[];
  crossSell: CrossSellResult[];
  actions: ActionResult[];
  documents: DocumentRecResult;
  risk: RiskRecResult;
  approvalProbability: number;
  disbursalProbability: number;
  recommendedLoanAmount?: number;
  recommendedTenure?: number;
  recommendedEmi?: number;
  generatedAt: string;
}

export interface RecommendationAnalytics {
  totalGenerated: number;
  acceptanceRate: number;
  lenderSuccessRate: number;
  approvalAccuracy: number;
  disbursalAccuracy: number;
  crossSellConversionRate: number;
  effectivenessScore: number;
  byType: Record<string, number>;
}
