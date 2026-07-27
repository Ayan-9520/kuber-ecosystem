export type DistributionScope = 'PRODUCT' | 'LENDER' | 'PARTNER_TIER' | 'DEFAULT' | 'CUSTOM';

export type StakeholderType =
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
  | 'REFERRAL'
  | 'OTHER';

export type ShareMode = 'PERCENT' | 'FIXED';

export type DistributionRunStatus = 'SIMULATED' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type AuditEntityType = 'RULE' | 'RUN';

export interface MatchingCriteria {
  product?: string | null;
  lenderName?: string | null;
  partnerId?: string | null;
  partnerTier?: string | null;
}

export interface StakeholderShare {
  stakeholderType: StakeholderType;
  label: string;
  mode: ShareMode;
  /** Used when mode = PERCENT (0–100). Percentage shares across a rule must sum to 100. */
  percentage: number;
  /** Used when mode = FIXED — absolute amount in INR. */
  fixedAmount: number;
}

export interface DistributionRule {
  id: string;
  name: string;
  scope: DistributionScope;
  matchingCriteria: MatchingCriteria;
  stakeholders: StakeholderShare[];
  gstPercent: number;
  tdsPercent: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
}

export interface StakeholderAllocation {
  stakeholderType: StakeholderType;
  label: string;
  mode: ShareMode;
  percentage: number;
  amount: number;
}

export interface DistributionRun {
  id: string;
  sourceRef: string;
  ruleId?: string | null;
  ruleName?: string | null;
  grossRevenue: number;
  allocations: StakeholderAllocation[];
  gstAmount: number;
  tdsAmount: number;
  netRevenue: number;
  status: DistributionRunStatus;
  context?: MatchingCriteria | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface DistributionAuditEvent {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  actorUserId: string;
  actorName: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt: string;
  ipAddress?: string | null;
}

export interface DistributionSummary {
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  totalRuns: number;
  completedRuns: number;
  pendingRuns: number;
  totalDistributed: number;
  totalGrossRevenue: number;
  totalGst: number;
  totalTds: number;
  uniqueStakeholderTypes: number;
  stakeholderCount: number;
}

export interface SimulationResult {
  rule: DistributionRule | null;
  grossRevenue: number;
  gstAmount: number;
  tdsAmount: number;
  netRevenue: number;
  allocations: StakeholderAllocation[];
  totalAllocated: number;
  remainder: number;
  isBalanced: boolean;
}

export interface RequestContext {
  actorId: string;
  actorName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ListRulesQuery {
  page: number;
  limit: number;
  search?: string;
  scope?: DistributionScope;
  isActive?: boolean;
}

export interface ListRunsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: DistributionRunStatus;
  sourceRef?: string;
  ruleId?: string;
}

export interface ListAuditQuery {
  page: number;
  limit: number;
  entityId?: string;
  action?: string;
  entityType?: AuditEntityType;
}

export interface CreateRuleInput {
  name: string;
  scope: DistributionScope;
  matchingCriteria?: MatchingCriteria;
  stakeholders: StakeholderShare[];
  gstPercent?: number;
  tdsPercent?: number;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateRuleInput {
  name?: string;
  scope?: DistributionScope;
  matchingCriteria?: MatchingCriteria;
  stakeholders?: StakeholderShare[];
  gstPercent?: number;
  tdsPercent?: number;
  priority?: number;
  isActive?: boolean;
}

export interface SimulateInput {
  grossRevenue: number;
  context?: MatchingCriteria;
  ruleId?: string;
  shares?: StakeholderShare[];
  gstPercent?: number;
  tdsPercent?: number;
}

export interface CreateRunInput {
  sourceRef: string;
  grossRevenue: number;
  context?: MatchingCriteria;
  ruleId?: string;
  shares?: StakeholderShare[];
  gstPercent?: number;
  tdsPercent?: number;
  status?: DistributionRunStatus;
}
