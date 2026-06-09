import { apiDownload, apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export type ExecutiveTimePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export type ExecutiveRoleType =
  | 'SALES_EXECUTIVE'
  | 'RELATIONSHIP_MANAGER'
  | 'CREDIT_EXECUTIVE'
  | 'OPERATIONS_EXECUTIVE';

export type ExecutivePeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type ExecutiveQuery = {
  timePreset?: ExecutiveTimePreset;
  periodType?: ExecutivePeriodType;
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
  executiveRole?: ExecutiveRoleType;
  branchId?: string;
  regionId?: string;
  productId?: string;
  limit?: number;
};

export const executiveAnalyticsService = {
  dashboard: (params?: ExecutiveQuery) =>
    apiGet<Record<string, unknown>>('/executive-analytics/dashboard', params),
  performance: (params?: ExecutiveQuery) =>
    apiGet<Record<string, unknown>>('/executive-analytics/performance', params),
  targets: (params?: ExecutiveQuery & { page?: number; limit?: number; isActive?: boolean }) =>
    apiGetPaginated<Record<string, unknown>>('/executive-analytics/targets', params),
  createTarget: (data: unknown) => apiPost<Record<string, unknown>>('/executive-analytics/targets', data),
  leaderboard: (params?: ExecutiveQuery) =>
    apiGet<Record<string, unknown>>('/executive-analytics/leaderboard', params),
  forecast: (params?: ExecutiveQuery) =>
    apiGet<Record<string, unknown>>('/executive-analytics/forecast', params),
  export: (params: ExecutiveQuery & { format?: 'CSV' | 'EXCEL' | 'PDF'; reportType?: string }) =>
    apiDownload('/executive-analytics/export', params),
};
