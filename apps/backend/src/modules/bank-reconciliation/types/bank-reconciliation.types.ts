export type StatementStatus = 'UPLOADED' | 'PARSED' | 'RECONCILED' | 'CLOSED';

export type MatchType = 'EXACT' | 'PROBABLE' | 'UNMATCHED';

export type VarianceType = 'SHORT_PAYMENT' | 'EXCESS' | 'MATCHED' | 'MISSING';

export type MatchReviewStatus =
  | 'PENDING_REVIEW'
  | 'ACCEPTED'
  | 'DISPUTED'
  | 'WRITTEN_OFF'
  | 'RESOLVED';

export type DisputeStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface StatementPeriod {
  month?: string | null;
  year?: number | null;
  from?: string | null;
  to?: string | null;
}

export interface BankCommissionStatement {
  id: string;
  bankName: string;
  statementPeriod: StatementPeriod;
  uploadedBy: string;
  uploadedAt: string;
  fileName: string;
  totalRows: number;
  totalAmount: number;
  status: StatementStatus;
}

export interface StatementLineItem {
  id: string;
  statementId: string;
  bankReference?: string | null;
  loanAccountNumber?: string | null;
  applicationNumber?: string | null;
  customerName: string;
  pan?: string | null;
  disbursedAmount: number;
  commissionAmount: number;
  gstAmount: number;
  tdsAmount: number;
  netAmount: number;
  payoutDate?: string | null;
  rawPayload?: Record<string, unknown> | null;
}

export interface ReconciliationMatch {
  id: string;
  statementLineId: string;
  statementId: string;
  bankName: string;
  matchedCaseId?: string | null;
  caseNumber?: string | null;
  matchType: MatchType;
  matchScore: number;
  expectedCommission: number;
  receivedCommission: number;
  variance: number;
  varianceType: VarianceType;
  status: MatchReviewStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  notes?: string | null;
  line?: StatementLineItem;
}

export interface ReconciliationDispute {
  id: string;
  matchId: string;
  bankName: string;
  raisedBy: string;
  raisedAt: string;
  amount: number;
  reason: string;
  status: DisputeStatus;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
}

export interface ReconciliationAuditEvent {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorUserId: string;
  actorName: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface BcreSummary {
  totalStatements: number;
  reconciledStatements: number;
  totalReceived: number;
  totalExpected: number;
  totalVariance: number;
  shortPaymentCount: number;
  shortPaymentAmount: number;
  excessCount: number;
  excessAmount: number;
  matchedCount: number;
  probableCount: number;
  unmatchedCount: number;
  matchedPercent: number;
  pendingReviewCount: number;
  openDisputes: number;
  acceptedCount: number;
  writtenOffCount: number;
}

export interface RequestContext {
  actorId: string;
  actorName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ListStatementsQuery {
  page: number;
  limit: number;
  bankName?: string;
  status?: StatementStatus;
  period?: string;
  search?: string;
}

export interface ListMatchesQuery {
  page: number;
  limit: number;
  statementId?: string;
  matchType?: MatchType;
  varianceType?: VarianceType;
  status?: MatchReviewStatus;
  bankName?: string;
  search?: string;
}

export interface ListDisputesQuery {
  page: number;
  limit: number;
  status?: DisputeStatus;
  bankName?: string;
  search?: string;
}

export interface ListAuditQuery {
  page: number;
  limit: number;
  entityId?: string;
  action?: string;
  entityType?: string;
}

export interface CreateStatementLineInput {
  bankReference?: string;
  loanAccountNumber?: string;
  applicationNumber?: string;
  customerName: string;
  pan?: string;
  disbursedAmount?: number;
  commissionAmount: number;
  gstAmount?: number;
  tdsAmount?: number;
  netAmount?: number;
  payoutDate?: string;
  rawPayload?: Record<string, unknown>;
}

export interface CreateStatementInput {
  bankName: string;
  statementPeriod?: StatementPeriod;
  fileName: string;
  lines: CreateStatementLineInput[];
}

export interface ReviewMatchInput {
  action: 'accept' | 'dispute' | 'write-off' | 'resolve';
  note?: string;
  reason?: string;
}

export interface CreateDisputeInput {
  reason: string;
  amount?: number;
}

export interface UpdateDisputeInput {
  status: DisputeStatus;
  resolutionNotes?: string;
}

export interface StatementDetail extends BankCommissionStatement {
  lines: StatementLineItem[];
  matches: ReconciliationMatch[];
}
