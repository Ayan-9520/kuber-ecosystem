import { z } from 'zod';

import { analyticsExportFormatSchema, analyticsTimePresetSchema } from './analytics.schema.js';
import { paginationSchema } from './pagination.schema.js';

export const executiveRoleTypeSchema = z.enum([
  'SALES_EXECUTIVE',
  'RELATIONSHIP_MANAGER',
  'CREDIT_EXECUTIVE',
  'OPERATIONS_EXECUTIVE',
]);

export const executivePeriodTypeSchema = z.enum([
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
]);

export const executiveAnalyticsBaseQuerySchema = z.object({
  timePreset: analyticsTimePresetSchema.optional(),
  periodType: executivePeriodTypeSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  employeeId: z.string().uuid().optional(),
  executiveRole: executiveRoleTypeSchema.optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export const executiveDashboardQuerySchema = executiveAnalyticsBaseQuerySchema;
export const executivePerformanceQuerySchema = executiveAnalyticsBaseQuerySchema;
export const executiveLeaderboardQuerySchema = executiveAnalyticsBaseQuerySchema.extend({
  limit: z.coerce.number().min(1).max(100).optional(),
});
export const executiveForecastQuerySchema = executiveAnalyticsBaseQuerySchema;
export const executiveTargetsQuerySchema = executiveAnalyticsBaseQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
});
export const executiveExportQuerySchema = executiveAnalyticsBaseQuerySchema.extend({
  format: analyticsExportFormatSchema.default('CSV'),
  reportType: z
    .enum(['dashboard', 'performance', 'targets', 'leaderboard', 'forecast', 'ai'])
    .default('dashboard'),
});

export const createExecutiveTargetSchema = z.object({
  employeeId: z.string().uuid(),
  executiveRole: executiveRoleTypeSchema,
  metricCode: z.string().min(2).max(80),
  metricName: z.string().min(2).max(150),
  targetValue: z.coerce.number().positive(),
  periodType: executivePeriodTypeSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export const listExecutiveTargetsQuerySchema = paginationSchema.merge(executiveTargetsQuerySchema);

export type ExecutiveAnalyticsBaseQuery = z.infer<typeof executiveAnalyticsBaseQuerySchema>;
export type ExecutiveDashboardQuery = z.infer<typeof executiveDashboardQuerySchema>;
export type ExecutivePerformanceQuery = z.infer<typeof executivePerformanceQuerySchema>;
export type ExecutiveLeaderboardQuery = z.infer<typeof executiveLeaderboardQuerySchema>;
export type ExecutiveForecastQuery = z.infer<typeof executiveForecastQuerySchema>;
export type ExecutiveTargetsQuery = z.infer<typeof executiveTargetsQuerySchema>;
export type ExecutiveExportQuery = z.infer<typeof executiveExportQuerySchema>;
export type CreateExecutiveTarget = z.infer<typeof createExecutiveTargetSchema>;
