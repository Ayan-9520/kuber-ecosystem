import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { userController, userRoleController } from '../controllers/user.controller.js';
import {
  assignUserRoleSchema,
  createUserSchema,
  listUserRolesQuerySchema,
  listUsersQuerySchema,
  updateUserSchema,
  uuidParamSchema,
} from '../validators/user.validator.js';

export const userRoutes: Router = Router();

userRoutes.use(authenticateWithSessionMiddleware);

userRoutes.get(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_READ, 'users.read:all'),
  validateMiddleware(listUsersQuerySchema, 'query'),
  asyncHandler(userController.list),
);

userRoutes.post(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_WRITE, 'users.create:all'),
  validateMiddleware(createUserSchema),
  asyncHandler(userController.create),
);

userRoutes.get(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_READ, 'users.read:branch', 'users.read:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(userController.getById),
);

userRoutes.patch(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_WRITE, 'users.update:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateUserSchema),
  asyncHandler(userController.update),
);

userRoutes.delete(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_WRITE, 'users.delete:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(userController.remove),
);

userRoutes.get(
  '/:id/roles',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_READ, 'users.read:branch', 'users.read:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(userController.listUserRoles),
);

export const userRoleRoutes: Router = Router();

userRoleRoutes.use(authenticateWithSessionMiddleware);

userRoleRoutes.get(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_READ, RBAC_PERMISSIONS.RBAC_READ, 'rbac.read:all'),
  validateMiddleware(listUserRolesQuerySchema, 'query'),
  asyncHandler(userRoleController.list),
);

userRoleRoutes.post(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_WRITE, 'users.update:all'),
  validateMiddleware(assignUserRoleSchema),
  asyncHandler(userRoleController.assign),
);

userRoleRoutes.delete(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.USERS_WRITE, 'users.update:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(userRoleController.remove),
);
