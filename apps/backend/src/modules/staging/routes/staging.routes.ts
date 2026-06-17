import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { stagingController } from '../controllers/staging.controller.js';
import {
  createReleaseValidationSchema,
  listReleaseValidationsQuerySchema,
  listStagingDeploymentsQuerySchema,
  stagingWebhookSchema,
} from '../validators/staging.validator.js';

const stagingRead = requireAnyPermission(RBAC_PERMISSIONS.STAGING_READ, 'staging.read');
const releaseManage = requireAnyPermission(RBAC_PERMISSIONS.RELEASE_MANAGE, 'release.manage');

export const stagingRoutes = Router();

stagingRoutes.post(
  '/deployments/webhook',
  validateMiddleware(stagingWebhookSchema),
  asyncHandler(stagingController.deploymentWebhook),
);

stagingRoutes.use(authenticateWithSessionMiddleware);

stagingRoutes.get('/status', stagingRead, asyncHandler(stagingController.status));
stagingRoutes.get('/health', stagingRead, asyncHandler(stagingController.stagingHealth));
stagingRoutes.get('/dashboard', stagingRead, asyncHandler(stagingController.dashboard));
stagingRoutes.get('/reports', stagingRead, asyncHandler(stagingController.reports));

stagingRoutes.get(
  '/releases',
  stagingRead,
  validateMiddleware(listReleaseValidationsQuerySchema, 'query'),
  asyncHandler(stagingController.listReleases),
);
stagingRoutes.post(
  '/releases',
  releaseManage,
  validateMiddleware(createReleaseValidationSchema),
  asyncHandler(stagingController.createRelease),
);

stagingRoutes.get(
  '/deployments',
  stagingRead,
  validateMiddleware(listStagingDeploymentsQuerySchema, 'query'),
  asyncHandler(stagingController.listDeployments),
);
