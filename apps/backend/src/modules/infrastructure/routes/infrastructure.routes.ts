import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { infrastructureController } from '../controllers/infrastructure.controller.js';
import {
  environmentCodeParamSchema,
  listDomainsQuerySchema,
  listEnvironmentsQuerySchema,
  listHealthQuerySchema,
  listServicesQuerySchema,
} from '../validators/infrastructure.validator.js';

const infraRead = requireAnyPermission(RBAC_PERMISSIONS.INFRASTRUCTURE_READ, 'infrastructure.read');
const deploymentManage = requireAnyPermission(
  RBAC_PERMISSIONS.DEPLOYMENT_MANAGE,
  'deployment.manage',
  RBAC_PERMISSIONS.INFRASTRUCTURE_MANAGE,
  'infrastructure.manage',
);

export const infrastructureRoutes = Router();

infrastructureRoutes.get('/health', asyncHandler(infrastructureController.health));
infrastructureRoutes.use(authenticateWithSessionMiddleware);

infrastructureRoutes.get('/overview', infraRead, asyncHandler(infrastructureController.overview));
infrastructureRoutes.get(
  '/environments',
  infraRead,
  validateMiddleware(listEnvironmentsQuerySchema, 'query'),
  asyncHandler(infrastructureController.listEnvironments),
);
infrastructureRoutes.get(
  '/environments/:code',
  infraRead,
  validateMiddleware(environmentCodeParamSchema, 'params'),
  asyncHandler(infrastructureController.getEnvironment),
);
infrastructureRoutes.get(
  '/services',
  infraRead,
  validateMiddleware(listServicesQuerySchema, 'query'),
  asyncHandler(infrastructureController.listServices),
);
infrastructureRoutes.get(
  '/domains',
  infraRead,
  validateMiddleware(listDomainsQuerySchema, 'query'),
  asyncHandler(infrastructureController.listDomains),
);
infrastructureRoutes.get(
  '/health-history',
  infraRead,
  validateMiddleware(listHealthQuerySchema, 'query'),
  asyncHandler(infrastructureController.listHealth),
);
infrastructureRoutes.get('/configs', infraRead, asyncHandler(infrastructureController.configs));
infrastructureRoutes.get('/deployment', deploymentManage, asyncHandler(infrastructureController.deploymentStatus));
