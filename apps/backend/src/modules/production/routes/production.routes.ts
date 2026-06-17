import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { productionController } from '../controllers/production.controller.js';
import {
  createIncidentSchema,
  createReleaseRecordSchema,
  listIncidentsQuerySchema,
  listProductionDeploymentsQuerySchema,
  listReleaseRecordsQuerySchema,
  productionWebhookSchema,
} from '../validators/production.validator.js';

const productionRead = requireAnyPermission(RBAC_PERMISSIONS.PRODUCTION_READ, 'production.read');
const productionManage = requireAnyPermission(RBAC_PERMISSIONS.PRODUCTION_MANAGE, 'production.manage');
const releaseManage = requireAnyPermission(RBAC_PERMISSIONS.RELEASE_MANAGE, 'release.manage');

export const productionRoutes = Router();

productionRoutes.post(
  '/deployments/webhook',
  validateMiddleware(productionWebhookSchema),
  asyncHandler(productionController.deploymentWebhook),
);

productionRoutes.use(authenticateWithSessionMiddleware);

productionRoutes.get('/status', productionRead, asyncHandler(productionController.status));
productionRoutes.get('/health', productionRead, asyncHandler(productionController.health));
productionRoutes.get('/go-live-gates', productionRead, asyncHandler(productionController.goLiveGates));
productionRoutes.get('/dashboard', productionRead, asyncHandler(productionController.dashboard));
productionRoutes.get('/reports', productionRead, asyncHandler(productionController.reports));

productionRoutes.get(
  '/releases',
  productionRead,
  validateMiddleware(listReleaseRecordsQuerySchema, 'query'),
  asyncHandler(productionController.listReleases),
);
productionRoutes.post(
  '/releases',
  releaseManage,
  validateMiddleware(createReleaseRecordSchema),
  asyncHandler(productionController.createRelease),
);

productionRoutes.get(
  '/deployments',
  productionRead,
  validateMiddleware(listProductionDeploymentsQuerySchema, 'query'),
  asyncHandler(productionController.listDeployments),
);

productionRoutes.get(
  '/incidents',
  productionRead,
  validateMiddleware(listIncidentsQuerySchema, 'query'),
  asyncHandler(productionController.listIncidents),
);
productionRoutes.post(
  '/incidents',
  productionManage,
  validateMiddleware(createIncidentSchema),
  asyncHandler(productionController.createIncident),
);
