import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { protectStubRoute } from '../../../shared/middleware/stub-auth.middleware.js';
import { employeeController } from '../controllers/employee.controller.js';

export const employeeRoutes: Router = Router();

protectStubRoute(employeeRoutes, RBAC_PERMISSIONS.USERS_READ);

employeeRoutes.get('/health', employeeController.health);
