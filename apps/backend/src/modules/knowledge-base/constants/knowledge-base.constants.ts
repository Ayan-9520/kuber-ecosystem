export const KNOWLEDGE_BASE_ROUTE_PREFIX = '/knowledge';
export const KNOWLEDGE_MODEL_VERSION = 'kb-v1.0';

export const DEFAULT_CATEGORIES = [
  { code: 'LOAN_POLICIES', name: 'Loan Policies', sortOrder: 1 },
  { code: 'HOME_LOAN', name: 'Home Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 10 },
  { code: 'LAP', name: 'LAP Policies', parentCode: 'LOAN_POLICIES', sortOrder: 20 },
  { code: 'BUSINESS_LOAN', name: 'Business Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 30 },
  { code: 'AUTO_LOAN', name: 'Auto Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 40 },
  { code: 'EV_LOAN', name: 'EV Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 50 },
  { code: 'BALANCE_TRANSFER', name: 'Balance Transfer Policies', parentCode: 'LOAN_POLICIES', sortOrder: 60 },
  { code: 'TOP_UP', name: 'Top-Up Policies', parentCode: 'LOAN_POLICIES', sortOrder: 70 },
  { code: 'ELIGIBILITY', name: 'Eligibility Rules', sortOrder: 2 },
  { code: 'DOCUMENT_REQ', name: 'Document Requirements', sortOrder: 3 },
  { code: 'LENDER_POLICIES', name: 'Lender Policies', sortOrder: 4 },
  { code: 'BANK_GUIDELINES', name: 'Bank Guidelines', parentCode: 'LENDER_POLICIES', sortOrder: 41 },
  { code: 'NBFC_GUIDELINES', name: 'NBFC Guidelines', parentCode: 'LENDER_POLICIES', sortOrder: 42 },
  { code: 'SALES_SCRIPTS', name: 'Sales Scripts', sortOrder: 5 },
  { code: 'SUPPORT_SCRIPTS', name: 'Support Scripts', sortOrder: 6 },
  { code: 'FAQS', name: 'FAQs', sortOrder: 7 },
  { code: 'TRAINING', name: 'Training Materials', sortOrder: 8 },
  { code: 'SOPS', name: 'Company SOPs', sortOrder: 9 },
  { code: 'COMPLIANCE', name: 'Compliance Guidelines', sortOrder: 10 },
  { code: 'OPERATIONS', name: 'Operational Guidelines', sortOrder: 11 },
  { code: 'MARKETING', name: 'Marketing Content', sortOrder: 12 },
] as const;

export const DEFAULT_TAGS = [
  { code: 'HOME_LOAN', name: 'Home Loan', tagGroup: 'products' },
  { code: 'PERSONAL_LOAN', name: 'Personal Loan', tagGroup: 'products' },
  { code: 'LAP', name: 'LAP', tagGroup: 'products' },
  { code: 'HDFC', name: 'HDFC Bank', tagGroup: 'lenders' },
  { code: 'ICICI', name: 'ICICI Bank', tagGroup: 'lenders' },
  { code: 'SALES', name: 'Sales', tagGroup: 'departments' },
  { code: 'CREDIT', name: 'Credit', tagGroup: 'departments' },
  { code: 'OPERATIONS', name: 'Operations', tagGroup: 'departments' },
  { code: 'KYC', name: 'KYC Process', tagGroup: 'processes' },
  { code: 'DISBURSAL', name: 'Disbursal', tagGroup: 'processes' },
  { code: 'LOW_RISK', name: 'Low Risk', tagGroup: 'risk' },
  { code: 'HIGH_RISK', name: 'High Risk', tagGroup: 'risk' },
] as const;

export const AI_CONTEXT_SOURCES = ['AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG'] as const;
