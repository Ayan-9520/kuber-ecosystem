import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { protectStubRoute } from '../../../shared/middleware/stub-auth.middleware.js';
import { branchController } from '../controllers/branch.controller.js';

export const branchRoutes: Router = Router();

protectStubRoute(branchRoutes, RBAC_PERMISSIONS.ANALYTICS_READ);

branchRoutes.get('/health', branchController.health);
