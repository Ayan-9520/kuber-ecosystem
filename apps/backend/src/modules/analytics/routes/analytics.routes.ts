import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { analyticsController } from '../controllers/analytics.controller.js';
import {
  analyticsAiQuerySchema,
  analyticsApplicationsQuerySchema,
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
  uuidParamSchema,
} from '../validators/analytics.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.ANALYTICS_READ, 'analytics.read');
const exportPerm = requireAnyPermission(RBAC_PERMISSIONS.ANALYTICS_EXPORT, RBAC_PERMISSIONS.ANALYTICS_READ, 'analytics.export', 'analytics.read');
const configure = requireAnyPermission(RBAC_PERMISSIONS.ANALYTICS_CONFIGURE, RBAC_PERMISSIONS.ANALYTICS_READ, 'analytics.configure', 'analytics.read');

export const analyticsRoutes = Router();
analyticsRoutes.use(authenticateWithSessionMiddleware);

analyticsRoutes.get('/health', read, asyncHandler(analyticsController.health));
analyticsRoutes.get('/overview', read, validateMiddleware(analyticsOverviewQuerySchema, 'query'), asyncHandler(analyticsController.overview));
analyticsRoutes.get('/kpis', read, validateMiddleware(analyticsKpisQuerySchema, 'query'), asyncHandler(analyticsController.kpis));
analyticsRoutes.get('/revenue', read, validateMiddleware(analyticsRevenueQuerySchema, 'query'), asyncHandler(analyticsController.revenue));
analyticsRoutes.get('/leads', read, validateMiddleware(analyticsLeadsQuerySchema, 'query'), asyncHandler(analyticsController.leads));
analyticsRoutes.get('/applications', read, validateMiddleware(analyticsApplicationsQuerySchema, 'query'), asyncHandler(analyticsController.applications));
analyticsRoutes.get('/commissions', read, validateMiddleware(analyticsCommissionsQuerySchema, 'query'), asyncHandler(analyticsController.commissions));
analyticsRoutes.get('/ai', read, validateMiddleware(analyticsAiQuerySchema, 'query'), asyncHandler(analyticsController.ai));
analyticsRoutes.get('/export', exportPerm, validateMiddleware(analyticsExportQuerySchema, 'query'), asyncHandler(analyticsController.export));

analyticsRoutes.get('/dashboards', read, validateMiddleware(listDashboardsQuerySchema, 'query'), asyncHandler(analyticsController.listDashboards));
analyticsRoutes.get('/reports', read, validateMiddleware(listAnalyticsReportsQuerySchema, 'query'), asyncHandler(analyticsController.listReports));
analyticsRoutes.post('/reports', configure, validateMiddleware(createAnalyticsReportSchema), asyncHandler(analyticsController.createReport));
analyticsRoutes.post('/reports/run', exportPerm, validateMiddleware(runAnalyticsReportSchema), asyncHandler(analyticsController.runReport));
analyticsRoutes.get('/reports/:id/executions', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(analyticsController.reportExecutions));
analyticsRoutes.post('/schedules', configure, validateMiddleware(createAnalyticsScheduleSchema), asyncHandler(analyticsController.createSchedule));
