import type { LoanCaseStage, LoanFulfillmentProduct } from './types';

export interface JourneyStageDef {
  id: LoanCaseStage;
  label: string;
  shortLabel: string;
  group: 'intake' | 'underwriting' | 'bank' | 'disbursement' | 'payout' | 'terminal';
}

/** Ordered fulfillment journey (excludes terminal REJECTED / ON_HOLD from main path). */
export const JOURNEY_STAGES: JourneyStageDef[] = [
  { id: 'LEAD_CREATED', label: 'Lead Created', shortLabel: 'Lead', group: 'intake' },
  { id: 'ASSIGNED', label: 'Assigned', shortLabel: 'Assigned', group: 'intake' },
  { id: 'ELIGIBILITY', label: 'Eligibility Check', shortLabel: 'Eligibility', group: 'intake' },
  { id: 'DOCUMENT_COLLECTION', label: 'Document Collection', shortLabel: 'Docs', group: 'underwriting' },
  { id: 'DOCUMENTS_VERIFIED', label: 'Documents Verified', shortLabel: 'Verified', group: 'underwriting' },
  { id: 'LOAN_LOGIN', label: 'Loan Login', shortLabel: 'Login', group: 'bank' },
  { id: 'BANK_PROCESSING', label: 'Bank Processing', shortLabel: 'Processing', group: 'bank' },
  { id: 'BANK_QUERY_RAISED', label: 'Bank Query Raised', shortLabel: 'Query', group: 'bank' },
  { id: 'QUERY_RESOLVED', label: 'Query Resolved', shortLabel: 'Resolved', group: 'bank' },
  { id: 'SANCTIONED', label: 'Sanctioned', shortLabel: 'Sanction', group: 'disbursement' },
  { id: 'DISBURSEMENT_SCHEDULED', label: 'Disbursement Scheduled', shortLabel: 'Scheduled', group: 'disbursement' },
  { id: 'DISBURSED', label: 'Disbursed', shortLabel: 'Disbursed', group: 'disbursement' },
  { id: 'COMMISSION_GENERATED', label: 'Commission Generated', shortLabel: 'Commission', group: 'payout' },
  { id: 'FINANCE_APPROVAL', label: 'Finance Approval', shortLabel: 'Finance', group: 'payout' },
  { id: 'PARTNER_PAYMENT', label: 'Partner Payment', shortLabel: 'Partner Pay', group: 'payout' },
  { id: 'EMPLOYEE_INCENTIVE', label: 'Employee Incentive', shortLabel: 'Incentive', group: 'payout' },
  { id: 'COMPLETED', label: 'Completed', shortLabel: 'Done', group: 'terminal' },
];

export const TERMINAL_STAGES: JourneyStageDef[] = [
  { id: 'REJECTED', label: 'Rejected', shortLabel: 'Rejected', group: 'terminal' },
  { id: 'ON_HOLD', label: 'On Hold', shortLabel: 'Hold', group: 'terminal' },
];

export const ALL_STAGES: JourneyStageDef[] = [...JOURNEY_STAGES, ...TERMINAL_STAGES];

const STAGE_INDEX = new Map(JOURNEY_STAGES.map((s, i) => [s.id, i]));

export function getStageLabel(stage: LoanCaseStage): string {
  return ALL_STAGES.find((s) => s.id === stage)?.label ?? stage.replace(/_/g, ' ');
}

export function getStageIndex(stage: LoanCaseStage): number {
  return STAGE_INDEX.get(stage) ?? -1;
}

export function isTerminalStage(stage: LoanCaseStage): boolean {
  return stage === 'REJECTED' || stage === 'ON_HOLD' || stage === 'COMPLETED';
}

export const PRODUCT_OPTIONS: { value: LoanFulfillmentProduct; label: string }[] = [
  { value: 'HOME_LOAN', label: 'Home Loan' },
  { value: 'LOAN_AGAINST_PROPERTY', label: 'Loan Against Property' },
  { value: 'BUSINESS_LOAN', label: 'Business Loan' },
  { value: 'WORKING_CAPITAL', label: 'Working Capital' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'AUTO_LOAN', label: 'Auto Loan' },
  { value: 'CONSTRUCTION_LOAN', label: 'Construction Loan' },
  { value: 'EDUCATION_LOAN', label: 'Education Loan' },
  { value: 'DOCTOR_LOAN', label: 'Doctor Loan' },
  { value: 'MSME_LOAN', label: 'MSME Loan' },
];

export function getProductLabel(product: LoanFulfillmentProduct | string): string {
  return PRODUCT_OPTIONS.find((p) => p.value === product)?.label ?? String(product).replace(/_/g, ' ');
}

export const STAGE_FILTER_OPTIONS = [
  { value: '', label: 'All stages' },
  ...ALL_STAGES.map((s) => ({ value: s.id, label: s.label })),
];

export const PRODUCT_FILTER_OPTIONS = [
  { value: '', label: 'All products' },
  ...PRODUCT_OPTIONS,
];
