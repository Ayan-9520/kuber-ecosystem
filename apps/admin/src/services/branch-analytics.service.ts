import { apiDownload, apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export type BranchTimePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export type BranchPeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type BranchRankingType = 'BRANCH' | 'REGIONAL' | 'PRODUCT' | 'REVENUE';

export type BranchQuery = {
  timePreset?: BranchTimePreset;
  periodType?: BranchPeriodType;
  fromDate?: string;
  toDate?: string;
  branchId?: string;
  regionId?: string;
  employeeId?: string;
  productId?: string;
  partnerId?: string;
  leadSourceId?: string;
  lenderId?: string;
  rankingType?: BranchRankingType;
  groupBy?: 'day' | 'week' | 'month' | 'product' | 'lender' | 'executive';
  limit?: number;
};

export const branchAnalyticsService = {
  dashboard: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/dashboard', params),
  performance: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/performance', params),
  revenue: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/revenue', params),
  leads: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/leads', params),
  applications: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/applications', params),
  partners: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/partners', params),
  forecast: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/forecast', params),
  rankings: (params?: BranchQuery) => apiGet<Record<string, unknown>>('/branch-analytics/rankings', params),
  targets: (params?: BranchQuery & { page?: number; limit?: number; isActive?: boolean }) =>
    apiGetPaginated<Record<string, unknown>>('/branch-analytics/targets', params),
  createTarget: (data: unknown) => apiPost<Record<string, unknown>>('/branch-analytics/targets', data),
  export: (params: BranchQuery & { format?: 'CSV' | 'EXCEL' | 'PDF'; reportType?: string }) =>
    apiDownload('/branch-analytics/export', params),
};
