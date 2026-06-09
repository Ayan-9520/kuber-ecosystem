import { apiDownload, apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export type RegionalTimePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export type RegionalPeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type RegionalRankingType = 'REGION' | 'BRANCH' | 'PRODUCT' | 'PARTNER' | 'EXECUTIVE';

export type RegionalQuery = {
  timePreset?: RegionalTimePreset;
  periodType?: RegionalPeriodType;
  fromDate?: string;
  toDate?: string;
  regionId?: string;
  branchId?: string;
  employeeId?: string;
  productId?: string;
  partnerId?: string;
  leadSourceId?: string;
  lenderId?: string;
  rankingType?: RegionalRankingType;
  groupBy?: 'day' | 'week' | 'month' | 'branch' | 'product' | 'lender' | 'executive';
  limit?: number;
};

export const regionalAnalyticsService = {
  dashboard: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/dashboard', params),
  performance: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/performance', params),
  revenue: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/revenue', params),
  leads: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/leads', params),
  applications: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/applications', params),
  branches: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/branches', params),
  partners: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/partners', params),
  forecast: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/forecast', params),
  rankings: (params?: RegionalQuery) => apiGet<Record<string, unknown>>('/regional-analytics/rankings', params),
  targets: (params?: RegionalQuery & { page?: number; limit?: number; isActive?: boolean }) =>
    apiGetPaginated<Record<string, unknown>>('/regional-analytics/targets', params),
  createTarget: (data: unknown) => apiPost<Record<string, unknown>>('/regional-analytics/targets', data),
  export: (params: RegionalQuery & { format?: 'CSV' | 'EXCEL' | 'PDF'; reportType?: string }) =>
    apiDownload('/regional-analytics/export', params),
};
