import type { LoanCaseStage } from '../types/loan-fulfillment.types.js';

/** Ordered journey stages for case progression (excludes terminal REJECTED / ON_HOLD). */
export const CASE_JOURNEY: LoanCaseStage[] = [
  'LEAD_CREATED',
  'ASSIGNED',
  'ELIGIBILITY',
  'DOCUMENT_COLLECTION',
  'DOCUMENTS_VERIFIED',
  'LOAN_LOGIN',
  'BANK_PROCESSING',
  'BANK_QUERY_RAISED',
  'QUERY_RESOLVED',
  'SANCTIONED',
  'DISBURSEMENT_SCHEDULED',
  'DISBURSED',
  'COMMISSION_GENERATED',
  'FINANCE_APPROVAL',
  'PARTNER_PAYMENT',
  'EMPLOYEE_INCENTIVE',
  'COMPLETED',
];

export const STAGE_LABELS: Record<LoanCaseStage, string> = {
  LEAD_CREATED: 'Lead Created',
  ASSIGNED: 'Assigned',
  ELIGIBILITY: 'Eligibility',
  DOCUMENT_COLLECTION: 'Document Collection',
  DOCUMENTS_VERIFIED: 'Documents Verified',
  LOAN_LOGIN: 'Loan Login',
  BANK_PROCESSING: 'Bank Processing',
  BANK_QUERY_RAISED: 'Bank Query Raised',
  QUERY_RESOLVED: 'Query Resolved',
  SANCTIONED: 'Sanctioned',
  DISBURSEMENT_SCHEDULED: 'Disbursement Scheduled',
  DISBURSED: 'Disbursed',
  COMMISSION_GENERATED: 'Commission Generated',
  FINANCE_APPROVAL: 'Finance Approval',
  PARTNER_PAYMENT: 'Partner Payment',
  EMPLOYEE_INCENTIVE: 'Employee Incentive',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
};

export const APPROVAL_CHAIN_STEPS = ['Employee', 'TeamLeader', 'Operations', 'Finance'] as const;

export const CASE_NUMBER_PREFIX = 'KF';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
