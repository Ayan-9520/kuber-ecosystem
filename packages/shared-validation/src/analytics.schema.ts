import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const analyticsTimePresetSchema = z.enum([
  'TODAY',
  'YESTERDAY',
  'THIS_WEEK',
  'THIS_MONTH',
  'THIS_QUARTER',
  'THIS_YEAR',
  'CUSTOM',
]);

export const analyticsDashboardTypeSchema = z.enum([
  'SYSTEM',
  'BUSINESS',
  'OPERATIONS',
  'SALES',
  'CREDIT',
  'MANAGEMENT',
]);

export const analyticsExportFormatSchema = z.enum(['CSV', 'EXCEL', 'PDF']);

export const analyticsBaseQuerySchema = z.object({
  timePreset: analyticsTimePresetSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  dashboardType: analyticsDashboardTypeSchema.optional(),
});

export const analyticsOverviewQuerySchema = analyticsBaseQuerySchema;
export const analyticsKpisQuerySchema = analyticsBaseQuerySchema.extend({
  categories: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()) : undefined)),
});
export const analyticsRevenueQuerySchema = analyticsBaseQuerySchema.extend({
  groupBy: z.enum(['day', 'week', 'month', 'branch', 'product', 'partner']).optional(),
});
export const analyticsLeadsQuerySchema = analyticsBaseQuerySchema;
export const analyticsApplicationsQuerySchema = analyticsBaseQuerySchema;
export const analyticsCommissionsQuerySchema = analyticsBaseQuerySchema.extend({
  groupBy: z.enum(['partner', 'branch', 'product', 'commissionType']).optional(),
});
export const analyticsAiQuerySchema = analyticsBaseQuerySchema;
export const analyticsExportQuerySchema = analyticsBaseQuerySchema.extend({
  format: analyticsExportFormatSchema.default('CSV'),
  reportType: z.enum(['overview', 'kpis', 'revenue', 'leads', 'applications', 'commissions', 'ai']).default('overview'),
});

export const listAnalyticsReportsQuerySchema = paginationSchema.extend({
  reportType: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createAnalyticsReportSchema = z.object({
  code: z.string().min(2).max(80),
  name: z.string().min(2).max(150),
  reportType: z.string().min(2).max(50),
  description: z.string().max(2000).optional(),
  config: z.record(z.unknown()).optional(),
});

export const runAnalyticsReportSchema = z.object({
  reportId: z.string().uuid().optional(),
  reportCode: z.string().optional(),
  format: analyticsExportFormatSchema.default('CSV'),
  parameters: analyticsBaseQuerySchema.optional(),
});

export const createAnalyticsScheduleSchema = z.object({
  reportId: z.string().uuid(),
  name: z.string().min(2).max(150),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  recipients: z.array(z.string().email()).min(1),
  format: analyticsExportFormatSchema.default('CSV'),
  timezone: z.string().default('Asia/Kolkata'),
});

export const listDashboardsQuerySchema = paginationSchema.extend({
  dashboardType: analyticsDashboardTypeSchema.optional(),
});

export type AnalyticsBaseQuery = z.infer<typeof analyticsBaseQuerySchema>;
export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewQuerySchema>;
export type AnalyticsKpisQuery = z.infer<typeof analyticsKpisQuerySchema>;
export type AnalyticsRevenueQuery = z.infer<typeof analyticsRevenueQuerySchema>;
export type AnalyticsLeadsQuery = z.infer<typeof analyticsLeadsQuerySchema>;
export type AnalyticsApplicationsQuery = z.infer<typeof analyticsApplicationsQuerySchema>;
export type AnalyticsCommissionsQuery = z.infer<typeof analyticsCommissionsQuerySchema>;
export type AnalyticsAiQuery = z.infer<typeof analyticsAiQuerySchema>;
export type AnalyticsExportQuery = z.infer<typeof analyticsExportQuerySchema>;
export type CreateAnalyticsReportInput = z.infer<typeof createAnalyticsReportSchema>;
export type RunAnalyticsReportInput = z.infer<typeof runAnalyticsReportSchema>;
export type CreateAnalyticsScheduleInput = z.infer<typeof createAnalyticsScheduleSchema>;
