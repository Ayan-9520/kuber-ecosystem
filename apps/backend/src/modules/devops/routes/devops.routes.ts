import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { devOpsController } from '../controllers/devops.controller.js';
import {
  createReleaseSchema,
  createRollbackSchema,
  devopsHistoryQuerySchema,
  devopsIdParamSchema,
  listDeploymentsQuerySchema,
  listPipelinesQuerySchema,
  listReleasesQuerySchema,
  listRollbacksQuerySchema,
  pipelineWebhookSchema,
} from '../validators/devops.validator.js';

const devopsRead = requireAnyPermission(RBAC_PERMISSIONS.DEVOPS_READ, 'devops.read');
const devopsDeploy = requireAnyPermission(RBAC_PERMISSIONS.DEVOPS_DEPLOY, 'devops.deploy');
const devopsRollback = requireAnyPermission(RBAC_PERMISSIONS.DEVOPS_ROLLBACK, 'devops.rollback');
const devopsManage = requireAnyPermission(RBAC_PERMISSIONS.DEVOPS_MANAGE, 'devops.manage');

export const devOpsRoutes = Router();

devOpsRoutes.get('/health', asyncHandler(devOpsController.health));

devOpsRoutes.post(
  '/pipelines/webhook',
  validateMiddleware(pipelineWebhookSchema),
  asyncHandler(devOpsController.pipelineWebhook),
);

devOpsRoutes.use(authenticateWithSessionMiddleware);

devOpsRoutes.get('/dashboard', devopsRead, asyncHandler(devOpsController.dashboard));

devOpsRoutes.get(
  '/pipelines',
  devopsRead,
  validateMiddleware(listPipelinesQuerySchema, 'query'),
  asyncHandler(devOpsController.listPipelines),
);
devOpsRoutes.get(
  '/pipelines/:id',
  devopsRead,
  validateMiddleware(devopsIdParamSchema, 'params'),
  asyncHandler(devOpsController.getPipeline),
);

devOpsRoutes.get(
  '/deployments',
  devopsRead,
  validateMiddleware(listDeploymentsQuerySchema, 'query'),
  asyncHandler(devOpsController.listDeployments),
);
devOpsRoutes.get(
  '/deployments/:id',
  devopsRead,
  validateMiddleware(devopsIdParamSchema, 'params'),
  asyncHandler(devOpsController.getDeployment),
);
devOpsRoutes.post('/deployments', devopsDeploy, asyncHandler(devOpsController.recordDeployment));

devOpsRoutes.get(
  '/releases',
  devopsRead,
  validateMiddleware(listReleasesQuerySchema, 'query'),
  asyncHandler(devOpsController.listReleases),
);
devOpsRoutes.post(
  '/releases',
  devopsManage,
  validateMiddleware(createReleaseSchema),
  asyncHandler(devOpsController.createRelease),
);
devOpsRoutes.post(
  '/releases/:id/publish',
  devopsManage,
  validateMiddleware(devopsIdParamSchema, 'params'),
  asyncHandler(devOpsController.publishRelease),
);

devOpsRoutes.get(
  '/rollbacks',
  devopsRead,
  validateMiddleware(listRollbacksQuerySchema, 'query'),
  asyncHandler(devOpsController.listRollbacks),
);
devOpsRoutes.post(
  '/rollbacks',
  devopsRollback,
  validateMiddleware(createRollbackSchema),
  asyncHandler(devOpsController.createRollback),
);

devOpsRoutes.get(
  '/history',
  devopsRead,
  validateMiddleware(devopsHistoryQuerySchema, 'query'),
  asyncHandler(devOpsController.history),
);
