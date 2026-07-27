/** Types aligned with database/prisma/schema/loan-fulfillment.prisma */

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

export type LoanCasePaymentStatus =
  | 'NOT_DUE'
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED';

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

export type LoanFulfillmentRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'SALES'
  | 'TEAM_LEADER'
  | 'PARTNER';

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
  partnerName?: string | null;
  connectorId?: string | null;
  relationshipManagerId?: string | null;
  relationshipManagerName?: string | null;
  salesEmployeeId?: string | null;
  salesEmployeeName?: string | null;
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
  timeline?: LoanCaseTimelineEvent[];
  documents?: LoanCaseDocument[];
  stakeholders?: LoanCaseStakeholder[];
  approvals?: LoanCaseApproval[];
  tasks?: LoanCaseTask[];
  activities?: LoanCaseActivity[];
  notes?: string | null;
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

export interface CreateLoanCaseInput {
  product: LoanFulfillmentProduct;
  lenderName: string;
  lenderId?: string;
  branchName?: string;
  customerName: string;
  mobile: string;
  email?: string;
  pan?: string;
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
  partnerId?: string;
  relationshipManagerId?: string;
  salesEmployeeId?: string;
  remarks?: string;
}

export interface PipelineStageCount {
  stage: LoanCaseStage;
  label: string;
  count: number;
  amount?: number;
}

export interface NamedAmount {
  name: string;
  amount: number;
  count?: number;
}

export interface MonthlyVolumePoint {
  month: string;
  cases: number;
  disbursement: number;
  revenue: number;
}

export interface LoanFulfillmentDashboard {
  totalCases: number;
  activeCases: number;
  sanctionedCount: number;
  disbursedCount: number;
  completedCount: number;
  rejectedCount: number;
  totalPipelineValue: number;
  totalSanctionedValue: number;
  totalDisbursedValue: number;
  expectedRevenue: number;
  revenueGenerated: number;
  pendingPayouts: number;
  paidPayouts: number;
  pendingApprovals: number;
  pendingDocumentCases: number;
  openTasks: number;
  overdueTasks: number;
  avgCycleDays: number;
  todayLeads: number;
  todayLogins: number;
  todaySanctions: number;
  todayDisbursements: number;
  pipeline: PipelineStageCount[];
  monthlyVolume: MonthlyVolumePoint[];
  revenueByBank: NamedAmount[];
  revenueByPartner: NamedAmount[];
  revenueByEmployee: NamedAmount[];
  loanTypeDistribution: NamedAmount[];
}
