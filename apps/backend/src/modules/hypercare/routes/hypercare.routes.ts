import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { hypercareController } from '../controllers/hypercare.controller.js';
import {
  createHypercareIncidentSchema,
  createHypercareIssueSchema,
  createHypercareRcaSchema,
  hypercareIncidentIdParamSchema,
  hypercareIssueIdParamSchema,
  hypercareReportsQuerySchema,
  hypercareStatusQuerySchema,
  listHypercareIncidentsQuerySchema,
  listHypercareIssuesQuerySchema,
  listHypercareMetricsQuerySchema,
  updateHypercareIncidentSchema,
  updateHypercareIssueSchema,
} from '../validators/hypercare.validator.js';

const hypercareRead = requireAnyPermission(
  RBAC_PERMISSIONS.HYPERCARE_READ,
  'hypercare.read',
  RBAC_PERMISSIONS.MONITORING_READ,
  'monitoring.read',
);

const hypercareManage = requireAnyPermission(
  RBAC_PERMISSIONS.HYPERCARE_MANAGE,
  'hypercare.manage',
);

const hypercareResolve = requireAnyPermission(
  RBAC_PERMISSIONS.HYPERCARE_RESOLVE,
  'hypercare.resolve',
  RBAC_PERMISSIONS.INCIDENT_MANAGE,
  'incident.manage',
);

export const hypercareRoutes = Router();

hypercareRoutes.use(authenticateWithSessionMiddleware);

hypercareRoutes.get('/status', hypercareRead, validateMiddleware(hypercareStatusQuerySchema, 'query'), asyncHandler(hypercareController.status));
hypercareRoutes.get('/reports', hypercareRead, validateMiddleware(hypercareReportsQuerySchema, 'query'), asyncHandler(hypercareController.reports));

hypercareRoutes.get('/incidents', hypercareRead, validateMiddleware(listHypercareIncidentsQuerySchema, 'query'), asyncHandler(hypercareController.incidents));
hypercareRoutes.post('/incidents', hypercareResolve, validateMiddleware(createHypercareIncidentSchema), asyncHandler(hypercareController.createIncident));
hypercareRoutes.patch('/incidents/:incidentId', hypercareResolve, validateMiddleware(hypercareIncidentIdParamSchema, 'params'), validateMiddleware(updateHypercareIncidentSchema), asyncHandler(hypercareController.updateIncident));

hypercareRoutes.get('/issues', hypercareRead, validateMiddleware(listHypercareIssuesQuerySchema, 'query'), asyncHandler(hypercareController.issues));
hypercareRoutes.post('/issues', hypercareManage, validateMiddleware(createHypercareIssueSchema), asyncHandler(hypercareController.createIssue));
hypercareRoutes.patch('/issues/:issueId', hypercareResolve, validateMiddleware(hypercareIssueIdParamSchema, 'params'), validateMiddleware(updateHypercareIssueSchema), asyncHandler(hypercareController.updateIssue));

hypercareRoutes.get('/metrics', hypercareRead, validateMiddleware(listHypercareMetricsQuerySchema, 'query'), asyncHandler(hypercareController.metrics));
hypercareRoutes.post('/metrics/snapshot', hypercareManage, asyncHandler(hypercareController.snapshotMetrics));

hypercareRoutes.post('/rca', hypercareResolve, validateMiddleware(createHypercareRcaSchema), asyncHandler(hypercareController.createRca));
