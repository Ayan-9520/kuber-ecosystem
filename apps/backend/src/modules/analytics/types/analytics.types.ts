import type { AnalyticsBaseQuery } from '@kuberone/shared-validation';

export interface AnalyticsContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ResolvedDateRange {
  fromDate: Date;
  toDate: Date;
  timePreset: string;
}

export interface KpiCard {
  code: string;
  name: string;
  value: number;
  unit?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'flat';
}

export interface ChartSeries {
  label: string;
  data: Array<{ x: string; y: number }>;
}

export interface AnalyticsOverview {
  period: ResolvedDateRange;
  scorecards: KpiCard[];
  leads: Record<string, unknown>;
  applications: Record<string, unknown>;
  commissions: Record<string, unknown>;
  support: Record<string, unknown>;
  ai: Record<string, unknown>;
  notifications: Record<string, unknown>;
}

export type ScopedQuery = AnalyticsBaseQuery & {
  fromDate: Date;
  toDate: Date;
};
