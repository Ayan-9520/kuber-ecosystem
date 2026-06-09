import { z } from 'zod';

export {
  analyticsAiQuerySchema,
  analyticsApplicationsQuerySchema,
  analyticsBaseQuerySchema,
  analyticsCommissionsQuerySchema,
  analyticsExportQuerySchema,
  analyticsKpisQuerySchema,
  analyticsLeadsQuerySchema,
  analyticsOverviewQuerySchema,
  analyticsRevenueQuerySchema,
  createAnalyticsReportSchema,
  createAnalyticsScheduleSchema,
  listAnalyticsReportsQuerySchema,
  listDashboardsQuerySchema,
  runAnalyticsReportSchema,
} from '@kuberone/shared-validation';

export const uuidParamSchema = z.object({ id: z.string().uuid() });
