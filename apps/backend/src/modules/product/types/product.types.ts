export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type EligibilityOutcome = 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NOT_ELIGIBLE';

export interface EligibilityEvaluationResult {
  outcome: EligibilityOutcome;
  approvalProbability: number;
  maximumLoanAmount: number | null;
  riskFlags: string[];
  failedRules: string[];
  passedRules: string[];
}

export interface DocumentResolutionResult {
  mandatoryDocuments: Array<{ documentTypeId: string; code?: string; name?: string; stage: string }>;
  optionalDocuments: Array<{ documentTypeId: string; code?: string; name?: string; stage: string }>;
  additionalDocuments: Array<{ documentTypeId: string; code?: string; name?: string; stage: string }>;
  riskDocuments: Array<{ documentTypeId: string; code?: string; name?: string; stage: string }>;
}

export interface ProductRecommendationResult {
  products: Array<{
    productId: string;
    productCode: string;
    productName: string;
    variantId?: string;
    variantName?: string;
    score: number;
    approvalProbability: number;
    recommendedLenders: Array<{ lenderId: string; lenderName: string; score: number }>;
    riskIndicators: string[];
  }>;
}
