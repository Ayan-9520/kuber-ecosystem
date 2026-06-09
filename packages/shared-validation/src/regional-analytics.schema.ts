import { z } from 'zod';

import { analyticsExportFormatSchema, analyticsTimePresetSchema } from './analytics.schema.js';
import { paginationSchema } from './pagination.schema.js';

export const regionalPeriodTypeSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']);

export const regionalRankingTypeSchema = z.enum(['REGION', 'BRANCH', 'PRODUCT', 'PARTNER', 'EXECUTIVE']);

export const regionalAnalyticsBaseQuerySchema = z.object({
  timePreset: analyticsTimePresetSchema.optional(),
  periodType: regionalPeriodTypeSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  regionId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  leadSourceId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
});

export const regionalDashboardQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalPerformanceQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalRevenueQuerySchema = regionalAnalyticsBaseQuerySchema.extend({
  groupBy: z.enum(['day', 'week', 'month', 'branch', 'product', 'lender', 'executive']).optional(),
});
export const regionalLeadsQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalApplicationsQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalBranchesQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalPartnersQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalForecastQuerySchema = regionalAnalyticsBaseQuerySchema;
export const regionalRankingsQuerySchema = regionalAnalyticsBaseQuerySchema.extend({
  rankingType: regionalRankingTypeSchema.optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});
export const regionalTargetsQuerySchema = regionalAnalyticsBaseQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
});
export const regionalExportQuerySchema = regionalAnalyticsBaseQuerySchema.extend({
  format: analyticsExportFormatSchema.default('CSV'),
  reportType: z
    .enum(['dashboard', 'performance', 'revenue', 'leads', 'applications', 'branches', 'partners', 'forecast', 'rankings', 'ai'])
    .default('dashboard'),
});

export const createRegionalTargetSchema = z.object({
  regionId: z.string().uuid(),
  metricCode: z.string().min(2).max(80),
  metricName: z.string().min(2).max(150),
  category: z.enum(['OVERVIEW', 'LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH']),
  targetValue: z.coerce.number().positive(),
  periodType: regionalPeriodTypeSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  productId: z.string().uuid().optional(),
});

export const listRegionalTargetsQuerySchema = paginationSchema.merge(regionalTargetsQuerySchema);

export type RegionalAnalyticsBaseQuery = z.infer<typeof regionalAnalyticsBaseQuerySchema>;
export type RegionalDashboardQuery = z.infer<typeof regionalDashboardQuerySchema>;
export type RegionalPerformanceQuery = z.infer<typeof regionalPerformanceQuerySchema>;
export type RegionalRevenueQuery = z.infer<typeof regionalRevenueQuerySchema>;
export type RegionalLeadsQuery = z.infer<typeof regionalLeadsQuerySchema>;
export type RegionalApplicationsQuery = z.infer<typeof regionalApplicationsQuerySchema>;
export type RegionalBranchesQuery = z.infer<typeof regionalBranchesQuerySchema>;
export type RegionalPartnersQuery = z.infer<typeof regionalPartnersQuerySchema>;
export type RegionalForecastQuery = z.infer<typeof regionalForecastQuerySchema>;
export type RegionalRankingsQuery = z.infer<typeof regionalRankingsQuerySchema>;
export type RegionalTargetsQuery = z.infer<typeof regionalTargetsQuerySchema>;
export type RegionalExportQuery = z.infer<typeof regionalExportQuerySchema>;
export type CreateRegionalTarget = z.infer<typeof createRegionalTargetSchema>;
