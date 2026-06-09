export const AGENT_NAME = 'Kuber AI Advisor';

export type AiLanguage = 'en' | 'hi' | 'hinglish';
export type AiAudience = 'customer' | 'dsa' | 'crm';

export const AI_CONVERSATION_ENTITY = 'ai_advisor_conversation';
export const AI_AUDIT_ENTITY = 'ai_advisor';

export const AI_ACTIONS = {
  CONVERSATION_STARTED: 'AI_CONVERSATION_STARTED',
  MESSAGE: 'AI_MESSAGE',
  RECOMMENDATION: 'AI_RECOMMENDATION',
  ELIGIBILITY: 'AI_ELIGIBILITY',
  CONTEXT_BUILT: 'AI_CONTEXT_BUILT',
} as const;

export const LANGUAGE_LABELS: Record<AiLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  hinglish: 'Hinglish (mix of Hindi and English)',
};

export const FINTECH_KNOWLEDGE_BASE: string[] = [
  'KuberOne by Kuber Finserve offers Home Loan, LAP, Business Loan, MSME, Auto, and EV loan products.',
  'Typical home loan documents: PAN, Aadhaar, salary slips/ITR, bank statements, property chain documents.',
  'FOIR above 50% may reduce eligibility; LTV above 75% may require higher down payment.',
  'Application lifecycle: Lead → Application → Bank Login → Credit Review → Sanction → Disbursement.',
  'Partners should upload complete KYC and ensure document deficiencies are cleared before sanction.',
  'CIBIL 700+ improves approval probability; stable income and clean repayment history are key.',
];

export const CUSTOMER_INTENTS = [
  'product_recommendation',
  'eligibility',
  'emi',
  'documents',
  'application_status',
  'lender_recommendation',
  'general',
] as const;

export const DSA_INTENTS = [
  'lender_recommendation',
  'approval_probability',
  'missing_documents',
  'next_best_action',
  'lead_qualification',
  'general',
] as const;

export const CRM_INTENTS = [
  'lead_summary',
  'risk_summary',
  'approval_probability',
  'lender_recommendation',
  'follow_up_recommendation',
  'general',
] as const;
