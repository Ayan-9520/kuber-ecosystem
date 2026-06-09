import type { ApprovalGrade } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface EmiBreakdown {
  emi: number;
  principal: number;
  interestPayable: number;
  totalRepayment: number;
  processingFee: number;
  totalCost: number;
}

export interface AmortizationYearSummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  outstandingBalance: number;
}

export interface EmiCalculationResult extends EmiBreakdown {
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  amortizationSummary: AmortizationYearSummary[];
}

export interface EligibilityMetrics {
  foir: number | null;
  ltv: number | null;
  dscr: number | null;
  riskScore: number;
}

export interface EligibilityCalculationResult extends EligibilityMetrics {
  eligibleAmount: number;
  approvalProbability: number;
  outcome: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  riskFlags: string[];
  failedRules: string[];
  passedRules: string[];
  productSlug?: string;
  productId?: string;
  variantId?: string;
}

export interface SavingsCalculationResult {
  currentEmi: number;
  newEmi: number;
  monthlySavings: number;
  annualSavings: number;
  lifetimeSavings: number;
  breakEvenMonths: number | null;
  newLoanAmount: number;
  totalSwitchCost: number;
}

export interface LoanComparisonOfferResult {
  label: string;
  lenderId?: string;
  lenderCode?: string;
  lenderName?: string;
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  emi: number;
  totalRepayment: number;
  totalInterest: number;
  processingFee: number;
  rank: number;
  score: number;
}

export interface LoanComparisonResult {
  offers: LoanComparisonOfferResult[];
  bestOfferLabel: string;
  rankBy: string;
}

export interface ApprovalProbabilityResult {
  grade: ApprovalGrade;
  approvalPercentage: number;
  riskScore: number;
  riskFlags: string[];
  eligibleAmount: number | null;
  foir: number | null;
  ltv: number | null;
  dscr: number | null;
  recommendation: string;
}

export interface AiAdvisorPayload {
  summary: string;
  metrics: Record<string, unknown>;
  recommendations: string[];
  riskFlags: string[];
}

export interface ProductRecommendation {
  productSlug: string;
  productName: string;
  score: number;
  reason: string;
}

export interface LenderRecommendation {
  lenderId: string;
  lenderCode: string;
  lenderName: string;
  score: number;
  estimatedEmi: number | null;
  reason: string;
}
