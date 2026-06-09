import { z } from 'zod';

import { analyticsExportFormatSchema, analyticsTimePresetSchema } from './analytics.schema.js';
import { paginationSchema } from './pagination.schema.js';

export const branchPeriodTypeSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']);

export const branchRankingTypeSchema = z.enum(['BRANCH', 'REGIONAL', 'PRODUCT', 'REVENUE']);

export const branchAnalyticsBaseQuerySchema = z.object({
  timePreset: analyticsTimePresetSchema.optional(),
  periodType: branchPeriodTypeSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  leadSourceId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
});

export const branchDashboardQuerySchema = branchAnalyticsBaseQuerySchema;
export const branchPerformanceQuerySchema = branchAnalyticsBaseQuerySchema;
export const branchRevenueQuerySchema = branchAnalyticsBaseQuerySchema.extend({
  groupBy: z.enum(['day', 'week', 'month', 'product', 'lender', 'executive']).optional(),
});
export const branchLeadsQuerySchema = branchAnalyticsBaseQuerySchema;
export const branchApplicationsQuerySchema = branchAnalyticsBaseQuerySchema;
export const branchPartnersQuerySchema = branchAnalyticsBaseQuerySchema;
export const branchForecastQuerySchema = branchAnalyticsBaseQuerySchema;
export const branchRankingsQuerySchema = branchAnalyticsBaseQuerySchema.extend({
  rankingType: branchRankingTypeSchema.optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});
export const branchTargetsQuerySchema = branchAnalyticsBaseQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
});
export const branchExportQuerySchema = branchAnalyticsBaseQuerySchema.extend({
  format: analyticsExportFormatSchema.default('CSV'),
  reportType: z
    .enum(['dashboard', 'performance', 'revenue', 'leads', 'applications', 'partners', 'forecast', 'rankings', 'ai'])
    .default('dashboard'),
});

export const createBranchTargetSchema = z.object({
  branchId: z.string().uuid(),
  metricCode: z.string().min(2).max(80),
  metricName: z.string().min(2).max(150),
  category: z.enum(['LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH']),
  targetValue: z.coerce.number().positive(),
  periodType: branchPeriodTypeSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  productId: z.string().uuid().optional(),
});

export const listBranchTargetsQuerySchema = paginationSchema.merge(branchTargetsQuerySchema);

export type BranchAnalyticsBaseQuery = z.infer<typeof branchAnalyticsBaseQuerySchema>;
export type BranchDashboardQuery = z.infer<typeof branchDashboardQuerySchema>;
export type BranchPerformanceQuery = z.infer<typeof branchPerformanceQuerySchema>;
export type BranchRevenueQuery = z.infer<typeof branchRevenueQuerySchema>;
export type BranchLeadsQuery = z.infer<typeof branchLeadsQuerySchema>;
export type BranchApplicationsQuery = z.infer<typeof branchApplicationsQuerySchema>;
export type BranchPartnersQuery = z.infer<typeof branchPartnersQuerySchema>;
export type BranchForecastQuery = z.infer<typeof branchForecastQuerySchema>;
export type BranchRankingsQuery = z.infer<typeof branchRankingsQuerySchema>;
export type BranchTargetsQuery = z.infer<typeof branchTargetsQuerySchema>;
export type BranchExportQuery = z.infer<typeof branchExportQuerySchema>;
export type CreateBranchTarget = z.infer<typeof createBranchTargetSchema>;
