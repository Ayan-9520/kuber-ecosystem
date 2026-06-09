import type { ExecutiveAnalyticsBaseQuery } from '@kuberone/shared-validation';

export type ExecutiveRoleType =
  | 'SALES_EXECUTIVE'
  | 'RELATIONSHIP_MANAGER'
  | 'CREDIT_EXECUTIVE'
  | 'OPERATIONS_EXECUTIVE';

export type ExecutivePeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type ResolvedExecutivePeriod = ExecutiveAnalyticsBaseQuery & {
  fromDate: Date;
  toDate: Date;
  periodType: ExecutivePeriodType;
};

export type ExecutiveKpi = {
  code: string;
  name: string;
  value: number;
  target?: number;
  achievementPct?: number;
  unit?: string;
  trend?: number;
};

export type ExecutiveScope = {
  employeeIds: string[];
  branchId?: string;
  regionId?: string;
  canViewTeam: boolean;
  executiveRole?: ExecutiveRoleType;
};

export type ExecutivePerformanceScores = {
  performanceScore: number;
  productivityScore: number;
  qualityScore: number;
  complianceScore: number;
  overallRating: number;
  breakdown: Record<string, unknown>;
};

export type ExecutiveDashboardPayload = {
  period: ResolvedExecutivePeriod;
  executiveRole: ExecutiveRoleType;
  employee: { id: string; name: string; designation?: string | null };
  kpis: ExecutiveKpi[];
  productivity: Record<string, number>;
  trends: {
    conversion: Array<{ date: string; value: number }>;
    productivity: Array<{ date: string; value: number }>;
    quality: Array<{ date: string; value: number }>;
    aiAdoption: Array<{ date: string; value: number }>;
  };
  ai: Record<string, unknown>;
};

export type ExecutiveAnalyticsContext = {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
};
