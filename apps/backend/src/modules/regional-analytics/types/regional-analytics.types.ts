import type { RegionalAnalyticsBaseQuery } from '@kuberone/shared-validation';

export type RegionalPeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type RegionalRankingType = 'REGION' | 'BRANCH' | 'PRODUCT' | 'PARTNER' | 'EXECUTIVE';
export type RegionalMetricCategory =
  | 'OVERVIEW'
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

export type ResolvedRegionalPeriod = RegionalAnalyticsBaseQuery & {
  fromDate: Date;
  toDate: Date;
  periodType: RegionalPeriodType;
};

export type RegionalKpi = {
  code: string;
  name: string;
  value: number;
  target?: number;
  achievementPct?: number;
  unit?: string;
  category?: RegionalMetricCategory;
};

export type RegionalScope = {
  regionId?: string;
  branchIds: string[];
  canViewAll: boolean;
};

export type RegionalPerformanceScores = {
  revenueScore: number;
  growthScore: number;
  operationsScore: number;
  complianceScore: number;
  customerScore: number;
  aiAdoptionScore: number;
  overallScore: number;
  breakdown: Record<string, unknown>;
};
