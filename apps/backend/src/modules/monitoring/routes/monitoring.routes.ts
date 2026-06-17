import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { monitoringController } from '../controllers/monitoring.controller.js';
import {
  listMonitoringAlertsQuerySchema,
  monitoringAnalyticsQuerySchema,
  monitoringIdParamSchema,
  updateMonitoringAlertSchema,
} from '../validators/monitoring.validator.js';

export const monitoringRoutes: Router = Router();

const monRead = requireAnyPermission(RBAC_PERMISSIONS.MONITORING_READ, 'monitoring.read');
const monManage = requireAnyPermission(RBAC_PERMISSIONS.MONITORING_MANAGE, 'monitoring.manage');
const monAlerts = requireAnyPermission(RBAC_PERMISSIONS.MONITORING_ALERTS, 'monitoring.alerts');

monitoringRoutes.get('/health', asyncHandler(monitoringController.health));

monitoringRoutes.use(authenticateWithSessionMiddleware);

monitoringRoutes.get('/overview', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.overview));
monitoringRoutes.get('/system', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.system));
monitoringRoutes.get('/application', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.application));
monitoringRoutes.get('/database', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.database));
monitoringRoutes.get('/queues', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.queues));
monitoringRoutes.get('/ai', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.ai));
monitoringRoutes.get('/notifications', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.notifications));
monitoringRoutes.get('/auth', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.authMetrics));
monitoringRoutes.get('/business', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.business));
monitoringRoutes.get('/sla', monRead, validateMiddleware(monitoringAnalyticsQuerySchema, 'query'), asyncHandler(monitoringController.sla));
monitoringRoutes.get('/deployment-readiness', monRead, asyncHandler(monitoringController.deploymentReadiness));
monitoringRoutes.get('/deep-health', monManage, asyncHandler(monitoringController.deepHealth));

monitoringRoutes.get('/alerts', monAlerts, validateMiddleware(listMonitoringAlertsQuerySchema, 'query'), asyncHandler(monitoringController.listAlerts));
monitoringRoutes.get('/alerts/summary', monAlerts, asyncHandler(monitoringController.alertsSummary));
monitoringRoutes.get('/alerts/:id', monAlerts, validateMiddleware(monitoringIdParamSchema, 'params'), asyncHandler(monitoringController.getAlert));
monitoringRoutes.patch('/alerts/:id', monAlerts, validateMiddleware(updateMonitoringAlertSchema), asyncHandler(monitoringController.updateAlert));
