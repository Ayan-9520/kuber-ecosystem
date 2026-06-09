export const RECOMMENDATION_MODEL_VERSION = 'rec-v1.0';
export const DEFAULT_WEIGHT_VERSION = 'rec-v1.0';

export const CROSS_SELL_PRODUCTS = [
  { code: 'INSURANCE', label: 'Loan Protection Insurance', minScore: 60 },
  { code: 'BALANCE_TRANSFER', label: 'Balance Transfer', minScore: 70 },
  { code: 'TOP_UP', label: 'Top-Up Loan', minScore: 75 },
  { code: 'BUSINESS_LOAN', label: 'Business Loan', minScore: 65 },
  { code: 'LAP', label: 'Loan Against Property', minScore: 68 },
  { code: 'AUTO_LOAN', label: 'Auto Loan', minScore: 62 },
] as const;

export const DEFAULT_RECOMMENDATION_WEIGHTS: Record<string, number> = {
  income: 0.15,
  cibil: 0.2,
  foir: 0.12,
  ltv: 0.1,
  leadScore: 0.15,
  location: 0.08,
  productFit: 0.1,
  lenderPolicy: 0.1,
  documentCompleteness: 0.1,
};

export const RECOMMENDATION_AUDIT_ACTIONS = {
  GENERATED: 'GENERATED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  RULE_CREATED: 'RULE_CREATED',
  RULE_UPDATED: 'RULE_UPDATED',
  WEIGHT_UPDATED: 'WEIGHT_UPDATED',
} as const;
