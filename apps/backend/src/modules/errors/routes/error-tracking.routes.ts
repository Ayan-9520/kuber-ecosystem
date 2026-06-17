import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { errorTrackingController } from '../controllers/error-tracking.controller.js';
import {
  assignErrorSchema,
  captureErrorSchema,
  errorAnalyticsQuerySchema,
  errorIdParamSchema,
  listErrorAlertsQuerySchema,
  listErrorsQuerySchema,
  resolveErrorSchema,
} from '../validators/error-tracking.validator.js';

export const errorTrackingRoutes: Router = Router();

const errorsRead = requireAnyPermission(RBAC_PERMISSIONS.ERRORS_READ, 'errors.read');
const errorsAssign = requireAnyPermission(RBAC_PERMISSIONS.ERRORS_ASSIGN, 'errors.assign');
const errorsResolve = requireAnyPermission(RBAC_PERMISSIONS.ERRORS_RESOLVE, 'errors.resolve');
const errorsAnalytics = requireAnyPermission(RBAC_PERMISSIONS.ERRORS_ANALYTICS, 'errors.analytics');

errorTrackingRoutes.get('/health', asyncHandler(errorTrackingController.health));

// Ingest — optional auth (mobile/CRM can send with or without session)
errorTrackingRoutes.post('/', validateMiddleware(captureErrorSchema), asyncHandler(errorTrackingController.capture));

errorTrackingRoutes.use(authenticateWithSessionMiddleware);

errorTrackingRoutes.get('/deployment-gate', errorsAnalytics, asyncHandler(errorTrackingController.deploymentGate));

errorTrackingRoutes.get('/', errorsRead, validateMiddleware(listErrorsQuerySchema, 'query'), asyncHandler(errorTrackingController.list));
errorTrackingRoutes.get('/groups', errorsRead, validateMiddleware(listErrorsQuerySchema, 'query'), asyncHandler(errorTrackingController.groups));
errorTrackingRoutes.get('/analytics', errorsAnalytics, validateMiddleware(errorAnalyticsQuerySchema, 'query'), asyncHandler(errorTrackingController.analytics));
errorTrackingRoutes.get('/alerts', errorsRead, validateMiddleware(listErrorAlertsQuerySchema, 'query'), asyncHandler(errorTrackingController.alerts));
errorTrackingRoutes.get('/assignments', errorsAssign, asyncHandler(errorTrackingController.assignments));
errorTrackingRoutes.post('/assign', errorsAssign, validateMiddleware(assignErrorSchema), asyncHandler(errorTrackingController.assign));
errorTrackingRoutes.post('/resolve', errorsResolve, validateMiddleware(resolveErrorSchema), asyncHandler(errorTrackingController.resolve));
errorTrackingRoutes.get('/:id', errorsRead, validateMiddleware(errorIdParamSchema, 'params'), asyncHandler(errorTrackingController.getById));
