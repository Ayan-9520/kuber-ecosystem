import type { BranchAnalyticsBaseQuery } from '@kuberone/shared-validation';

export type BranchPeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BranchRankingType = 'BRANCH' | 'REGIONAL' | 'PRODUCT' | 'REVENUE';
export type BranchMetricCategory =
  | 'LEAD'
  | 'APPLICATION'
  | 'REVENUE'
  | 'PRODUCT'
  | 'EXECUTIVE'
  | 'PARTNER'
  | 'COMMISSION'
  | 'SUPPORT'
  | 'AI'
  | 'GROWTH';

export type ResolvedBranchPeriod = BranchAnalyticsBaseQuery & {
  fromDate: Date;
  toDate: Date;
  periodType: BranchPeriodType;
};

export type BranchKpi = {
  code: string;
  name: string;
  value: number;
  target?: number;
  achievementPct?: number;
  unit?: string;
  category?: BranchMetricCategory;
};

export type BranchScope = {
  branchIds: string[];
  regionId?: string;
  canViewRegion: boolean;
  canViewAll: boolean;
};

export type BranchPerformanceScores = {
  growthScore: number;
  revenueScore: number;
  operationsScore: number;
  complianceScore: number;
  customerScore: number;
  overallScore: number;
  breakdown: Record<string, unknown>;
};

export type BranchAnalyticsContext = {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
};
