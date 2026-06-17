import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { backendDeploymentController } from '../controllers/backend-deployment.controller.js';
import {
  backendDeploymentWebhookSchema,
  createBackendDeploymentSchema,
  createDeploymentVersionSchema,
  listBackendDeploymentsQuerySchema,
  listDeploymentVersionsQuerySchema,
} from '../validators/backend-deployment.validator.js';

const deployRead = requireAnyPermission(
  RBAC_PERMISSIONS.BACKEND_DEPLOY,
  'backend.deploy',
  RBAC_PERMISSIONS.BACKEND_RELEASE,
  'backend.release',
  RBAC_PERMISSIONS.BACKEND_MANAGE,
  'backend.manage',
  RBAC_PERMISSIONS.PRODUCTION_READ,
  'production.read',
);

const deployWrite = requireAnyPermission(
  RBAC_PERMISSIONS.BACKEND_DEPLOY,
  'backend.deploy',
  RBAC_PERMISSIONS.BACKEND_MANAGE,
  'backend.manage',
  RBAC_PERMISSIONS.DEVOPS_DEPLOY,
  'devops.deploy',
);

const releaseWrite = requireAnyPermission(
  RBAC_PERMISSIONS.BACKEND_RELEASE,
  'backend.release',
  RBAC_PERMISSIONS.BACKEND_MANAGE,
  'backend.manage',
  RBAC_PERMISSIONS.RELEASE_MANAGE,
  'release.manage',
);

export const backendDeploymentRoutes = Router();

backendDeploymentRoutes.post(
  '/webhook',
  validateMiddleware(backendDeploymentWebhookSchema),
  asyncHandler(backendDeploymentController.webhook),
);

backendDeploymentRoutes.use(authenticateWithSessionMiddleware);

backendDeploymentRoutes.get('/status', deployRead, asyncHandler(backendDeploymentController.status));
backendDeploymentRoutes.get('/health', deployRead, asyncHandler(backendDeploymentController.health));
backendDeploymentRoutes.get('/services', deployRead, asyncHandler(backendDeploymentController.services));
backendDeploymentRoutes.get('/dashboard', deployRead, asyncHandler(backendDeploymentController.dashboard));
backendDeploymentRoutes.get('/reports', deployRead, asyncHandler(backendDeploymentController.reports));

backendDeploymentRoutes.get(
  '/releases',
  deployRead,
  validateMiddleware(listDeploymentVersionsQuerySchema, 'query'),
  asyncHandler(backendDeploymentController.listReleases),
);
backendDeploymentRoutes.post(
  '/releases',
  releaseWrite,
  validateMiddleware(createDeploymentVersionSchema),
  asyncHandler(backendDeploymentController.createVersion),
);

backendDeploymentRoutes.get(
  '/deployments',
  deployRead,
  validateMiddleware(listBackendDeploymentsQuerySchema, 'query'),
  asyncHandler(backendDeploymentController.listDeployments),
);
backendDeploymentRoutes.post(
  '/deployments',
  deployWrite,
  validateMiddleware(createBackendDeploymentSchema),
  asyncHandler(backendDeploymentController.createDeployment),
);
