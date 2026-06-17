import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { branchController, regionController } from '../controllers/branch.controller.js';
import {
  createBranchSchema,
  createRegionSchema,
  listBranchesQuerySchema,
  listRegionsQuerySchema,
  updateBranchSchema,
  updateRegionSchema,
  uuidParamSchema,
} from '../validators/branch.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'branches.read',
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_READ,
);
const write = requireAnyPermission(
  RBAC_PERMISSIONS.ANALYTICS_CONFIGURE,
  'branches.write',
  RBAC_PERMISSIONS.BRANCH_ANALYTICS_MANAGE,
);

export const branchRoutes: Router = Router();

branchRoutes.use(authenticateWithSessionMiddleware);
branchRoutes.get('/health', asyncHandler(branchController.health));
branchRoutes.get('/regions', read, validateMiddleware(listRegionsQuerySchema, 'query'), asyncHandler(regionController.list));
branchRoutes.post('/regions', write, validateMiddleware(createRegionSchema), asyncHandler(regionController.create));
branchRoutes.get(
  '/regions/:id',
  read,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(regionController.getById),
);
branchRoutes.patch(
  '/regions/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateRegionSchema),
  asyncHandler(regionController.update),
);
branchRoutes.get('/', read, validateMiddleware(listBranchesQuerySchema, 'query'), asyncHandler(branchController.list));
branchRoutes.post('/', write, validateMiddleware(createBranchSchema), asyncHandler(branchController.create));
branchRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(branchController.getById));
branchRoutes.patch(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateBranchSchema),
  asyncHandler(branchController.update),
);
branchRoutes.delete(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(branchController.remove),
);
