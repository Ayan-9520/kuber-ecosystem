/**
 * Dynamic Revenue Distribution Engine (DRDE)
 * API-backed rules, simulation, runs, and audit.
 */

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

export type DrdeRole =
  | 'PARTNER'
  | 'CALLER'
  | 'SALES_COORDINATOR'
  | 'MANAGER'
  | 'FINANCE'
  | 'ADMIN';

export type DrdeModuleId =
  | 'revenue-distribution'
  | 'simulate'
  | 'runs'
  | 'audit-log';

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
  percentage: number;
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

export interface DrdeModuleDef {
  id: DrdeModuleId;
  label: string;
  description: string;
  roles: DrdeRole[];
}

export const STAKEHOLDER_TYPE_OPTIONS: Array<{ value: StakeholderType; label: string }> = [
  { value: 'PARTNER', label: 'Financial Partner' },
  { value: 'EMPLOYEE', label: 'Financial Professional' },
  { value: 'TEAM_LEADER', label: 'Business Mentor' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'CONNECTOR', label: 'Connector' },
  { value: 'BROKER', label: 'Broker' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
  { value: 'RELATIONSHIP_MANAGER', label: 'Relationship Manager' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'OTHER', label: 'Other' },
];

export const SCOPE_OPTIONS: Array<{ value: DistributionScope; label: string }> = [
  { value: 'PRODUCT', label: 'Product' },
  { value: 'LENDER', label: 'Lender' },
  { value: 'PARTNER_TIER', label: 'Partner tier' },
  { value: 'DEFAULT', label: 'Default' },
  { value: 'CUSTOM', label: 'Custom' },
];
