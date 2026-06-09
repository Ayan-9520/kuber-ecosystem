import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { executiveAnalyticsController } from '../controllers/executive-analytics.controller.js';
import {
  createExecutiveTargetSchema,
  executiveDashboardQuerySchema,
  executiveExportQuerySchema,
  executiveForecastQuerySchema,
  executiveLeaderboardQuerySchema,
  executivePerformanceQuerySchema,
  listExecutiveTargetsQuerySchema,
} from '../validators/executive-analytics.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.EXECUTIVE_ANALYTICS_READ,
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'executive_analytics.read',
  'analytics.read',
);
const exportPerm = requireAnyPermission(
  RBAC_PERMISSIONS.EXECUTIVE_ANALYTICS_EXPORT,
  RBAC_PERMISSIONS.EXECUTIVE_ANALYTICS_READ,
  'executive_analytics.export',
  'executive_analytics.read',
);
const manage = requireAnyPermission(
  RBAC_PERMISSIONS.EXECUTIVE_ANALYTICS_MANAGE,
  'executive_analytics.manage',
);

export const executiveAnalyticsRoutes = Router();
executiveAnalyticsRoutes.use(authenticateWithSessionMiddleware);

executiveAnalyticsRoutes.get('/health', read, asyncHandler(executiveAnalyticsController.health));
executiveAnalyticsRoutes.get(
  '/dashboard',
  read,
  validateMiddleware(executiveDashboardQuerySchema, 'query'),
  asyncHandler(executiveAnalyticsController.dashboard),
);
executiveAnalyticsRoutes.get(
  '/performance',
  read,
  validateMiddleware(executivePerformanceQuerySchema, 'query'),
  asyncHandler(executiveAnalyticsController.performance),
);
executiveAnalyticsRoutes.get(
  '/targets',
  read,
  validateMiddleware(listExecutiveTargetsQuerySchema, 'query'),
  asyncHandler(executiveAnalyticsController.targets),
);
executiveAnalyticsRoutes.post(
  '/targets',
  manage,
  validateMiddleware(createExecutiveTargetSchema),
  asyncHandler(executiveAnalyticsController.createTarget),
);
executiveAnalyticsRoutes.get(
  '/leaderboard',
  read,
  validateMiddleware(executiveLeaderboardQuerySchema, 'query'),
  asyncHandler(executiveAnalyticsController.leaderboard),
);
executiveAnalyticsRoutes.get(
  '/forecast',
  read,
  validateMiddleware(executiveForecastQuerySchema, 'query'),
  asyncHandler(executiveAnalyticsController.forecast),
);
executiveAnalyticsRoutes.get(
  '/export',
  exportPerm,
  validateMiddleware(executiveExportQuerySchema, 'query'),
  asyncHandler(executiveAnalyticsController.export),
);
