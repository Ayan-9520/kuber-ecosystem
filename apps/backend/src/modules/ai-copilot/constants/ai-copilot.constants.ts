export const COPILOT_MODEL_VERSION = '1.0.0';
export const COPILOT_PROVIDER = 'kuber-copilot-engine';

export const COPILOT_ACTIONS = {
  SESSION_STARTED: 'COPILOT_SESSION_STARTED',
  LEAD_ANALYZED: 'COPILOT_LEAD_ANALYZED',
  APPLICATION_ANALYZED: 'COPILOT_APPLICATION_ANALYZED',
  FEEDBACK_SUBMITTED: 'COPILOT_FEEDBACK_SUBMITTED',
} as const;

export const COPILOT_AUDIT_ENTITY = 'ai_copilot';

export const CROSS_SELL_PRODUCTS = [
  { code: 'INSURANCE', label: 'Loan Protection Insurance', minScore: 60 },
  { code: 'BALANCE_TRANSFER', label: 'Balance Transfer', minScore: 70 },
  { code: 'TOP_UP', label: 'Top-Up Loan', minScore: 75 },
  { code: 'BUSINESS_LOAN', label: 'Business Loan', minScore: 65 },
  { code: 'LAP', label: 'Loan Against Property', minScore: 68 },
  { code: 'AUTO_LOAN', label: 'Auto Loan', minScore: 62 },
] as const;
