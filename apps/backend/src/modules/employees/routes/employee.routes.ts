import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { employeeController } from '../controllers/employee.controller.js';
import {
  createEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
  uuidParamSchema,
} from '../validators/employee.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.USERS_READ, 'employees.read');
const write = requireAnyPermission(RBAC_PERMISSIONS.USERS_WRITE, 'employees.write');

export const employeeRoutes: Router = Router();

employeeRoutes.use(authenticateWithSessionMiddleware);
employeeRoutes.get('/health', asyncHandler(employeeController.health));
employeeRoutes.get('/', read, validateMiddleware(listEmployeesQuerySchema, 'query'), asyncHandler(employeeController.list));
employeeRoutes.post('/', write, validateMiddleware(createEmployeeSchema), asyncHandler(employeeController.create));
employeeRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(employeeController.getById));
employeeRoutes.patch(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateEmployeeSchema),
  asyncHandler(employeeController.update),
);
employeeRoutes.delete(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(employeeController.remove),
);
