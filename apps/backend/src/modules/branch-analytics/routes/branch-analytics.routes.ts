import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { branchAnalyticsController } from '../controllers/branch-analytics.controller.js';
import {
  branchApplicationsQuerySchema,
  branchDashboardQuerySchema,
  branchExportQuerySchema,
  branchForecastQuerySchema,
  branchLeadsQuerySchema,
  branchPartnersQuerySchema,
  branchPerformanceQuerySchema,
  branchRankingsQuerySchema,
  branchRevenueQuerySchema,
  createBranchTargetSchema,
  listBranchTargetsQuerySchema,
} from '../validators/branch-analytics.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_READ,
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'branch_analytics.read',
  'analytics.read',
);
const regionRead = requireAnyPermission(
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_REGION,
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_READ,
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'branch_analytics.region',
  'branch_analytics.read',
  'analytics.read',
);
const exportPerm = requireAnyPermission(
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_EXPORT,
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_READ,
  'branch_analytics.export',
  'branch_analytics.read',
);
const manage = requireAnyPermission(RBAC_PERMISSIONS.BRANCH_ANALYTICS_MANAGE, 'branch_analytics.manage');

export const branchAnalyticsRoutes = Router();
branchAnalyticsRoutes.use(authenticateWithSessionMiddleware);

branchAnalyticsRoutes.get('/health', read, asyncHandler(branchAnalyticsController.health));
branchAnalyticsRoutes.get(
  '/dashboard',
  read,
  validateMiddleware(branchDashboardQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.dashboard),
);
branchAnalyticsRoutes.get(
  '/performance',
  read,
  validateMiddleware(branchPerformanceQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.performance),
);
branchAnalyticsRoutes.get(
  '/revenue',
  read,
  validateMiddleware(branchRevenueQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.revenue),
);
branchAnalyticsRoutes.get(
  '/leads',
  read,
  validateMiddleware(branchLeadsQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.leads),
);
branchAnalyticsRoutes.get(
  '/applications',
  read,
  validateMiddleware(branchApplicationsQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.applications),
);
branchAnalyticsRoutes.get(
  '/partners',
  read,
  validateMiddleware(branchPartnersQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.partners),
);
branchAnalyticsRoutes.get(
  '/forecast',
  read,
  validateMiddleware(branchForecastQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.forecast),
);
branchAnalyticsRoutes.get(
  '/rankings',
  regionRead,
  validateMiddleware(branchRankingsQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.rankings),
);
branchAnalyticsRoutes.get(
  '/targets',
  read,
  validateMiddleware(listBranchTargetsQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.targets),
);
branchAnalyticsRoutes.post(
  '/targets',
  manage,
  validateMiddleware(createBranchTargetSchema),
  asyncHandler(branchAnalyticsController.createTarget),
);
branchAnalyticsRoutes.get(
  '/export',
  exportPerm,
  validateMiddleware(branchExportQuerySchema, 'query'),
  asyncHandler(branchAnalyticsController.export),
);
