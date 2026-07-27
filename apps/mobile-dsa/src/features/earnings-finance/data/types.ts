/** Partner-facing earnings types — aligned with backend CommissionStatus. */

export type CommissionLifecycleStatus =
  | 'PENDING'
  | 'CALCULATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'RECOVERED'
  | 'ADJUSTED';

export type InvoiceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TimelineEvent {
  id: string;
  status: string;
  label: string;
  at: string;
  by: string;
  comment?: string;
}

export interface PartnerCommissionItem {
  id: string;
  reference: string;
  product: string;
  caseId: string;
  grossAmount: number;
  tdsAmount: number;
  netAmount: number;
  status: CommissionLifecycleStatus;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface PartnerInvoiceItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  netPayable: number;
  status: InvoiceStatus;
  raisedAt: string;
  timeline: TimelineEvent[];
}
