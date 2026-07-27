/**
 * Earnings & Finance — shared domain types.
 * Partner app (DSA) + Admin Finance desk use the same module / RBAC model.
 * Figures come from commission ledger, approvals, payments, and analytics APIs.
 */

export type FinanceRole = 'PARTNER' | 'FINANCE' | 'SUPER_ADMIN';

export type TimelineActor = 'PARTNER' | 'FINANCE' | 'SYSTEM' | 'SUPER_ADMIN';

export interface StatusTimelineEvent {
  id: string;
  status: string;
  label: string;
  at: string;
  by: string;
  actor: TimelineActor;
  comment?: string;
}

/** Backend CommissionLedger.status */
export type LedgerStatus =
  | 'PENDING'
  | 'CALCULATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'RECOVERED'
  | 'ADJUSTED';

export interface LedgerRow {
  id: string;
  ledgerNumber: string;
  partnerId: string;
  partnerName: string;
  partnerCode?: string;
  product: string;
  commissionType: string;
  commissionAmount: number;
  baseAmount: number;
  status: string;
  caseRef: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  calculatedAt?: string;
  timeline: StatusTimelineEvent[];
}

export interface ApprovalRow {
  id: string;
  approvalNumber: string;
  ledgerId: string;
  ledgerNumber?: string;
  partnerName: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  timeline: StatusTimelineEvent[];
}

export interface PaymentRow {
  id: string;
  paymentNumber: string;
  partnerId: string;
  partnerName: string;
  totalAmount: number;
  status: string;
  paymentReference?: string;
  releasedAt?: string;
  createdAt: string;
}

export type EarningsModuleId =
  | 'earnings-dashboard'
  | 'commission-tracker'
  | 'raise-invoice'
  | 'invoice-approval'
  | 'invoice-timeline'
  | 'wallet'
  | 'pending'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'rejected'
  | 'payout-history'
  | 'ledger'
  | 'tds-centre'
  | 'gst-reports'
  | 'statements'
  | 'incentives'
  | 'bonuses'
  | 'referral-income'
  | 'analytics';

export interface EarningsModuleDef {
  id: EarningsModuleId;
  label: string;
  description: string;
  icon: string;
  /** Roles that can open this module */
  roles: FinanceRole[];
}
