import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { observabilityController } from '../controllers/observability.controller.js';
import { observabilityDataService } from '../services/observability-data.service.js';
import {
  listObservabilityErrorsQuerySchema,
  listObservabilityEventsQuerySchema,
  listObservabilityLogsQuerySchema,
  listObservabilityTracesQuerySchema,
  observabilityIdParamSchema,
  observabilityQuerySchema,
  observabilitySearchQuerySchema,
} from '../validators/observability.validator.js';

export const observabilityRoutes: Router = Router();

const obsRead = requireAnyPermission(
  RBAC_PERMISSIONS.OBSERVABILITY_READ,
  'observability.read',
  RBAC_PERMISSIONS.LOGS_READ,
  'logs.read',
);
const tracesRead = requireAnyPermission(
  RBAC_PERMISSIONS.OBSERVABILITY_READ,
  'observability.read',
  RBAC_PERMISSIONS.TRACES_READ,
  'traces.read',
);
const obsManage = requireAnyPermission(RBAC_PERMISSIONS.OBSERVABILITY_MANAGE, 'observability.manage');

observabilityRoutes.get('/health', asyncHandler(observabilityController.health));

observabilityRoutes.use(authenticateWithSessionMiddleware);

observabilityRoutes.get('/overview', obsRead, validateMiddleware(observabilityQuerySchema, 'query'), asyncHandler(observabilityController.overview));
observabilityRoutes.get('/ai', obsRead, validateMiddleware(observabilityQuerySchema, 'query'), asyncHandler(observabilityController.aiObservability));

observabilityRoutes.get('/logs', obsRead, validateMiddleware(listObservabilityLogsQuerySchema, 'query'), asyncHandler(observabilityController.logs));
observabilityRoutes.get('/traces', tracesRead, validateMiddleware(listObservabilityTracesQuerySchema, 'query'), asyncHandler(observabilityController.traces));
observabilityRoutes.get('/traces/:traceId', tracesRead, asyncHandler(observabilityController.getTrace));
observabilityRoutes.get('/errors', obsRead, validateMiddleware(listObservabilityErrorsQuerySchema, 'query'), asyncHandler(observabilityController.errors));
observabilityRoutes.get('/errors/:id', obsRead, validateMiddleware(observabilityIdParamSchema, 'params'), asyncHandler(observabilityController.getError));
observabilityRoutes.get('/events', obsRead, validateMiddleware(listObservabilityEventsQuerySchema, 'query'), asyncHandler(observabilityController.events));
observabilityRoutes.get('/search', obsRead, validateMiddleware(observabilitySearchQuerySchema, 'query'), asyncHandler(observabilityController.search));

observabilityRoutes.get('/retention', obsManage, asyncHandler(async (_req, res) => {
  const overview = await observabilityDataService.overview();
  res.json({ success: true, data: overview.retentionPolicies });
}));
