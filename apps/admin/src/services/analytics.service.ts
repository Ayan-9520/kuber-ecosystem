import { apiDownload, apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export type AnalyticsTimePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export type AnalyticsQuery = {
  timePreset?: AnalyticsTimePreset;
  fromDate?: string;
  toDate?: string;
  branchId?: string;
  regionId?: string;
  partnerId?: string;
  groupBy?: string;
  categories?: string;
};

export const analyticsService = {
  overview: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/overview', params),
  kpis: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/kpis', params),
  revenue: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/revenue', params),
  leads: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/leads', params),
  applications: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/applications', params),
  commissions: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/commissions', params),
  ai: (params?: AnalyticsQuery) => apiGet<Record<string, unknown>>('/analytics/ai', params),
  dashboards: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/analytics/dashboards', params),
  reports: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/analytics/reports', params),
  runReport: (data: unknown) => apiPost<Record<string, unknown>>('/analytics/reports/run', data),
  createSchedule: (data: unknown) => apiPost<Record<string, unknown>>('/analytics/schedules', data),
  export: (params: AnalyticsQuery & { format?: 'CSV' | 'EXCEL' | 'PDF'; reportType?: string }) =>
    apiDownload('/analytics/export', params),
};
