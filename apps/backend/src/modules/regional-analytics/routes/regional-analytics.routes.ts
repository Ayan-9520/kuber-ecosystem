import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { regionalAnalyticsController } from '../controllers/regional-analytics.controller.js';
import {
  createRegionalTargetSchema,
  listRegionalTargetsQuerySchema,
  regionalApplicationsQuerySchema,
  regionalBranchesQuerySchema,
  regionalDashboardQuerySchema,
  regionalExportQuerySchema,
  regionalForecastQuerySchema,
  regionalLeadsQuerySchema,
  regionalPartnersQuerySchema,
  regionalPerformanceQuerySchema,
  regionalRankingsQuerySchema,
  regionalRevenueQuerySchema,
} from '../validators/regional-analytics.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.REGIONAL_ANALYTICS_READ,
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'regional_analytics.read',
  'analytics.read',
);
const allRegions = requireAnyPermission(
  RBAC_PERMISSIONS.REGIONAL_ANALYTICS_ALL,
  RBAC_PERMISSIONS.REGIONAL_ANALYTICS_READ,
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'regional_analytics.all',
  'regional_analytics.read',
  'analytics.read',
);
const exportPerm = requireAnyPermission(
  RBAC_PERMISSIONS.REGIONAL_ANALYTICS_EXPORT,
  RBAC_PERMISSIONS.REGIONAL_ANALYTICS_READ,
  'regional_analytics.export',
  'regional_analytics.read',
);
const manage = requireAnyPermission(RBAC_PERMISSIONS.REGIONAL_ANALYTICS_MANAGE, 'regional_analytics.manage');

export const regionalAnalyticsRoutes = Router();
regionalAnalyticsRoutes.use(authenticateWithSessionMiddleware);

regionalAnalyticsRoutes.get('/health', read, asyncHandler(regionalAnalyticsController.health));
regionalAnalyticsRoutes.get(
  '/dashboard',
  read,
  validateMiddleware(regionalDashboardQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.dashboard),
);
regionalAnalyticsRoutes.get(
  '/performance',
  read,
  validateMiddleware(regionalPerformanceQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.performance),
);
regionalAnalyticsRoutes.get(
  '/revenue',
  read,
  validateMiddleware(regionalRevenueQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.revenue),
);
regionalAnalyticsRoutes.get(
  '/leads',
  read,
  validateMiddleware(regionalLeadsQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.leads),
);
regionalAnalyticsRoutes.get(
  '/applications',
  read,
  validateMiddleware(regionalApplicationsQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.applications),
);
regionalAnalyticsRoutes.get(
  '/branches',
  read,
  validateMiddleware(regionalBranchesQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.branches),
);
regionalAnalyticsRoutes.get(
  '/partners',
  read,
  validateMiddleware(regionalPartnersQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.partners),
);
regionalAnalyticsRoutes.get(
  '/forecast',
  read,
  validateMiddleware(regionalForecastQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.forecast),
);
regionalAnalyticsRoutes.get(
  '/rankings',
  allRegions,
  validateMiddleware(regionalRankingsQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.rankings),
);
regionalAnalyticsRoutes.get(
  '/targets',
  read,
  validateMiddleware(listRegionalTargetsQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.targets),
);
regionalAnalyticsRoutes.post(
  '/targets',
  manage,
  validateMiddleware(createRegionalTargetSchema),
  asyncHandler(regionalAnalyticsController.createTarget),
);
regionalAnalyticsRoutes.get(
  '/export',
  exportPerm,
  validateMiddleware(regionalExportQuerySchema, 'query'),
  asyncHandler(regionalAnalyticsController.export),
);
