import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { governanceController } from '../controllers/governance.controller.js';
import {
  governanceAnalyticsQuerySchema,
  listSecurityAlertsQuerySchema,
  listSecurityEventsQuerySchema,
  updateSecurityAlertSchema,
} from '../validators/governance.validator.js';

export const securityRoutes: Router = Router();

const securityRead = requireAnyPermission(RBAC_PERMISSIONS.SECURITY_READ, 'security.read');
const securityManage = requireAnyPermission(RBAC_PERMISSIONS.SECURITY_MANAGE, 'security.manage');

securityRoutes.use(authenticateWithSessionMiddleware);

securityRoutes.get('/dashboard', securityRead, validateMiddleware(governanceAnalyticsQuerySchema, 'query'), asyncHandler(governanceController.securityDashboard));
securityRoutes.get('/events', securityRead, validateMiddleware(listSecurityEventsQuerySchema, 'query'), asyncHandler(governanceController.listSecurityEvents));
securityRoutes.get('/alerts', securityRead, validateMiddleware(listSecurityAlertsQuerySchema, 'query'), asyncHandler(governanceController.listSecurityAlerts));
securityRoutes.post('/alerts/update', securityManage, validateMiddleware(updateSecurityAlertSchema), asyncHandler(governanceController.updateSecurityAlert));
securityRoutes.get('/ai-governance', securityRead, validateMiddleware(governanceAnalyticsQuerySchema, 'query'), asyncHandler(governanceController.aiGovernance));
securityRoutes.get('/threats', securityRead, validateMiddleware(governanceAnalyticsQuerySchema, 'query'), asyncHandler(governanceController.threatDashboard));
