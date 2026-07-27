export type LoanCaseStage =
  | 'LEAD_CREATED'
  | 'ASSIGNED'
  | 'ELIGIBILITY'
  | 'DOCUMENT_COLLECTION'
  | 'DOCUMENTS_VERIFIED'
  | 'LOAN_LOGIN'
  | 'BANK_PROCESSING'
  | 'BANK_QUERY_RAISED'
  | 'QUERY_RESOLVED'
  | 'SANCTIONED'
  | 'DISBURSEMENT_SCHEDULED'
  | 'DISBURSED'
  | 'COMMISSION_GENERATED'
  | 'FINANCE_APPROVAL'
  | 'PARTNER_PAYMENT'
  | 'EMPLOYEE_INCENTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'ON_HOLD';

export type LoanFulfillmentProduct =
  | 'HOME_LOAN'
  | 'LOAN_AGAINST_PROPERTY'
  | 'BUSINESS_LOAN'
  | 'WORKING_CAPITAL'
  | 'PERSONAL_LOAN'
  | 'AUTO_LOAN'
  | 'CONSTRUCTION_LOAN'
  | 'EDUCATION_LOAN'
  | 'DOCTOR_LOAN'
  | 'MSME_LOAN';

export type LoanCaseApprovalStatus = 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';

export type LoanCasePaymentStatus = 'NOT_DUE' | 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED';

export type LoanStakeholderType =
  | 'PARTNER'
  | 'CONNECTOR'
  | 'BROKER'
  | 'EMPLOYEE'
  | 'TEAM_LEADER'
  | 'SALES_MANAGER'
  | 'RELATIONSHIP_MANAGER'
  | 'OPERATIONS'
  | 'FINANCE'
  | 'COMPANY'
  | 'OTHER';

export type LoanCaseDocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'PHOTOGRAPH'
  | 'SALARY_SLIP'
  | 'ITR'
  | 'BANK_STATEMENT'
  | 'PROPERTY_PAPERS'
  | 'AGREEMENT'
  | 'SANCTION_LETTER'
  | 'DISBURSEMENT_LETTER'
  | 'PDD'
  | 'OTHER';

export type LoanCaseTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LoanCaseTaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface LoanCaseTimelineEvent {
  id: string;
  loanCaseId: string;
  stage: LoanCaseStage;
  title: string;
  description?: string | null;
  performedBy?: string | null;
  performedById?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface LoanCaseDocument {
  id: string;
  loanCaseId: string;
  documentType: LoanCaseDocumentType;
  fileName: string;
  storageKey: string;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  version: number;
  uploadedById?: string | null;
  uploadedByName?: string | null;
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
}

export interface LoanCaseStakeholder {
  id: string;
  loanCaseId: string;
  stakeholderType: LoanStakeholderType;
  stakeholderName: string;
  stakeholderRefId?: string | null;
  sharePercent: number;
  amount: number;
  approvalStatus: LoanCaseApprovalStatus;
  paymentStatus: LoanCasePaymentStatus;
  paidAt?: string | null;
  transactionRef?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanCaseApproval {
  id: string;
  loanCaseId: string;
  step: string;
  status: LoanCaseApprovalStatus;
  comment?: string | null;
  actedById?: string | null;
  actedByName?: string | null;
  actedAt?: string | null;
  createdAt: string;
}

export interface LoanCaseTask {
  id: string;
  loanCaseId: string;
  title: string;
  description?: string | null;
  priority: LoanCaseTaskPriority;
  status: LoanCaseTaskStatus;
  dueAt?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanCaseActivity {
  id: string;
  loanCaseId: string;
  action: string;
  detail?: string | null;
  userId?: string | null;
  userName?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface LoanRevenueRule {
  id: string;
  name: string;
  lenderName: string;
  lenderId?: string | null;
  product: LoanFulfillmentProduct;
  revenuePercent: number;
  gstPercent: number;
  tdsPercent: number;
  platformSharePercent: number;
  partnerSharePercent: number;
  employeeSharePercent: number;
  teamSharePercent: number;
  managerSharePercent: number;
  companySharePercent: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
}

export interface LoanCase {
  id: string;
  caseNumber: string;
  stage: LoanCaseStage;
  product: LoanFulfillmentProduct;
  lenderName: string;
  lenderId?: string | null;
  branchName?: string | null;
  branchId?: string | null;
  applicationId?: string | null;
  leadId?: string | null;
  customerId?: string | null;
  partnerId?: string | null;
  /** Derived at read time from the PARTNER stakeholder; never persisted. */
  partnerName?: string | null;
  connectorId?: string | null;
  relationshipManagerId?: string | null;
  salesEmployeeId?: string | null;
  customerName: string;
  pan?: string | null;
  aadhaarMasked?: string | null;
  mobile: string;
  email?: string | null;
  occupation?: string | null;
  employer?: string | null;
  annualIncome?: number | null;
  propertyAddress?: string | null;
  city?: string | null;
  state?: string | null;
  referralSource?: string | null;
  projectName?: string | null;
  loanAmount: number;
  requestedAmount: number;
  eligibleAmount?: number | null;
  sanctionAmount?: number | null;
  disbursementAmount?: number | null;
  interestRate?: number | null;
  tenureMonths?: number | null;
  emiAmount?: number | null;
  bankApplicationNumber?: string | null;
  loanAccountNumber?: string | null;
  expectedSanctionDate?: string | null;
  expectedDisbursementDate?: string | null;
  expectedRevenue?: number | null;
  expectedCommission?: number | null;
  revenueGenerated?: number | null;
  gstAmount?: number | null;
  tdsAmount?: number | null;
  netRevenue?: number | null;
  /** Internal company margin — stripped for partner views */
  companyMargin?: number | null;
  /** Employee incentive pool — stripped for partner views */
  employeeIncentiveTotal?: number | null;
  approvalStatus: LoanCaseApprovalStatus;
  paymentStatus: LoanCasePaymentStatus;
  aiEligibilityScore?: number | null;
  aiRiskScore?: number | null;
  aiBankRecommendation?: string | null;
  aiCaseSummary?: string | null;
  remarks?: string | null;
  internalNotes?: string | null;
  metadata?: Record<string, unknown> | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  updatedById?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
  timeline: LoanCaseTimelineEvent[];
  documents: LoanCaseDocument[];
  stakeholders: LoanCaseStakeholder[];
  approvals: LoanCaseApproval[];
  tasks: LoanCaseTask[];
  activities: LoanCaseActivity[];
}

/** Partner-safe case projection */
export interface PartnerLoanCaseView
  extends Omit<
    LoanCase,
    | 'internalNotes'
    | 'companyMargin'
    | 'employeeIncentiveTotal'
    | 'stakeholders'
    | 'gstAmount'
    | 'tdsAmount'
    | 'netRevenue'
    | 'revenueGenerated'
  > {
  internalNotes?: never;
  companyMargin?: never;
  employeeIncentiveTotal?: never;
  stakeholders: LoanCaseStakeholder[];
  expectedCommission?: number | null;
  paidCommission?: number | null;
  pendingCommission?: number | null;
  /** Convenience rollup so partner clients don't recompute commission splits. */
  myCommission?: {
    expected: number;
    pending: number;
    paid: number;
  };
}

export interface DashboardKpis {
  totalCases: number;
  activeCases: number;
  sanctionedCases: number;
  disbursedCases: number;
  completedCases: number;
  onHoldCases: number;
  rejectedCases: number;
  totalLoanAmount: number;
  totalSanctionAmount: number;
  totalDisbursementAmount: number;
  totalExpectedRevenue: number;
  totalExpectedCommission: number;
  totalRevenueGenerated: number;
  pendingPayoutAmount: number;
  paidPayoutAmount: number;
  pendingApprovals: number;
  pendingDocumentCases: number;
  openTasks: number;
  overdueTasks: number;
  avgCycleDays: number;
  todayLeads: number;
  todayLogins: number;
  todaySanctions: number;
  todayDisbursements: number;
}

export interface RevenueSlice {
  name: string;
  amount: number;
  count: number;
}

export interface DashboardChartSeries {
  casesByStage: Array<{ stage: LoanCaseStage; label: string; count: number; amount: number }>;
  casesByProduct: Array<{ product: LoanFulfillmentProduct; count: number; volume: number }>;
  monthlyVolume: Array<{ month: string; cases: number; disbursement: number; revenue: number }>;
  approvalFunnel: Array<{ step: string; pending: number; approved: number; rejected: number }>;
  revenueByBank: RevenueSlice[];
  revenueByPartner: RevenueSlice[];
  revenueByEmployee: RevenueSlice[];
}

export interface DashboardAnalytics {
  kpis: DashboardKpis;
  charts: DashboardChartSeries;
}

export interface RevenueDistribution {
  baseRevenue: number;
  gstAmount: number;
  tdsAmount: number;
  netRevenue: number;
  shares: Array<{
    key: string;
    percent: number;
    amount: number;
  }>;
}

export interface RequestContext {
  actorId: string;
  actorName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ListCasesQuery {
  page: number;
  limit: number;
  stage?: LoanCaseStage;
  product?: LoanFulfillmentProduct;
  partnerId?: string;
  partner?: string;
  employee?: string;
  lenderName?: string;
  city?: string;
  state?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'loanAmount' | 'caseNumber';
  sortOrder: 'asc' | 'desc';
}

export interface ListRevenueRulesQuery {
  page?: number;
  limit?: number;
  product?: LoanFulfillmentProduct;
  lenderName?: string;
  isActive?: boolean;
  search?: string;
}

export interface CreateLoanCaseInput {
  product: LoanFulfillmentProduct;
  lenderName: string;
  lenderId?: string;
  branchName?: string;
  branchId?: string;
  applicationId?: string;
  leadId?: string;
  customerId?: string;
  partnerId?: string;
  connectorId?: string;
  relationshipManagerId?: string;
  salesEmployeeId?: string;
  customerName: string;
  pan?: string;
  aadhaarMasked?: string;
  mobile: string;
  email?: string;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  propertyAddress?: string;
  city?: string;
  state?: string;
  referralSource?: string;
  projectName?: string;
  loanAmount: number;
  requestedAmount: number;
  eligibleAmount?: number;
  interestRate?: number;
  tenureMonths?: number;
  remarks?: string;
  internalNotes?: string;
  stakeholders?: Array<{
    stakeholderType: LoanStakeholderType;
    stakeholderName: string;
    stakeholderRefId?: string;
    sharePercent: number;
  }>;
}

export interface UpdateLoanCaseInput {
  stage?: LoanCaseStage;
  lenderName?: string;
  branchName?: string;
  customerName?: string;
  mobile?: string;
  email?: string;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  propertyAddress?: string;
  city?: string;
  state?: string;
  loanAmount?: number;
  requestedAmount?: number;
  eligibleAmount?: number | null;
  sanctionAmount?: number | null;
  disbursementAmount?: number | null;
  interestRate?: number | null;
  tenureMonths?: number | null;
  emiAmount?: number | null;
  bankApplicationNumber?: string | null;
  loanAccountNumber?: string | null;
  expectedSanctionDate?: string | null;
  expectedDisbursementDate?: string | null;
  expectedRevenue?: number | null;
  expectedCommission?: number | null;
  revenueGenerated?: number | null;
  companyMargin?: number | null;
  employeeIncentiveTotal?: number | null;
  approvalStatus?: LoanCaseApprovalStatus;
  paymentStatus?: LoanCasePaymentStatus;
  remarks?: string | null;
  internalNotes?: string | null;
  aiEligibilityScore?: number | null;
  aiRiskScore?: number | null;
  aiBankRecommendation?: string | null;
  aiCaseSummary?: string | null;
}

export interface StakeholderInput {
  stakeholderType: LoanStakeholderType;
  stakeholderName: string;
  stakeholderRefId?: string;
  sharePercent: number;
}

export interface CreateDocumentInput {
  documentType: LoanCaseDocumentType;
  fileName: string;
  storageKey: string;
  mimeType?: string;
  fileSizeBytes?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: LoanCaseTaskPriority;
  dueAt?: string;
  assignedToId?: string;
  assignedToName?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: LoanCaseTaskPriority;
  status?: LoanCaseTaskStatus;
  dueAt?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
}

export interface DecideApprovalInput {
  status: 'APPROVED' | 'REJECTED' | 'ON_HOLD';
  comment?: string;
}

export interface CreateRevenueRuleInput {
  name: string;
  lenderName: string;
  lenderId?: string;
  product: LoanFulfillmentProduct;
  revenuePercent: number;
  gstPercent?: number;
  tdsPercent?: number;
  platformSharePercent?: number;
  partnerSharePercent?: number;
  employeeSharePercent?: number;
  teamSharePercent?: number;
  managerSharePercent?: number;
  companySharePercent?: number;
  isActive?: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateRevenueRuleInput {
  name?: string;
  lenderName?: string;
  revenuePercent?: number;
  gstPercent?: number;
  tdsPercent?: number;
  platformSharePercent?: number;
  partnerSharePercent?: number;
  employeeSharePercent?: number;
  teamSharePercent?: number;
  managerSharePercent?: number;
  companySharePercent?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
}
