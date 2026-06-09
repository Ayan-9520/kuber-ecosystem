import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { roleController, rolePermissionController } from '../controllers/role.controller.js';
import {
  assignRolePermissionSchema,
  createRoleSchema,
  listRolePermissionsQuerySchema,
  listRolesQuerySchema,
  removeRolePermissionSchema,
  updateRoleSchema,
  uuidParamSchema,
} from '../validators/role.validator.js';

export const roleRoutes: Router = Router();

roleRoutes.use(authenticateWithSessionMiddleware);

roleRoutes.get(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.ROLES_READ, RBAC_PERMISSIONS.RBAC_READ, 'rbac.read:all'),
  validateMiddleware(listRolesQuerySchema, 'query'),
  roleController.list,
);

roleRoutes.post(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.ROLES_WRITE, RBAC_PERMISSIONS.RBAC_CONFIGURE, 'rbac.configure:all'),
  validateMiddleware(createRoleSchema),
  roleController.create,
);

roleRoutes.get(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.ROLES_READ, RBAC_PERMISSIONS.RBAC_READ, 'rbac.read:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  roleController.getById,
);

roleRoutes.patch(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.ROLES_WRITE, RBAC_PERMISSIONS.RBAC_CONFIGURE, 'rbac.configure:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateRoleSchema),
  roleController.update,
);

roleRoutes.delete(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.ROLES_WRITE, RBAC_PERMISSIONS.RBAC_CONFIGURE, 'rbac.configure:all'),
  validateMiddleware(uuidParamSchema, 'params'),
  roleController.remove,
);

export const rolePermissionRoutes: Router = Router();

rolePermissionRoutes.use(authenticateWithSessionMiddleware);

rolePermissionRoutes.get(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.ROLES_READ, RBAC_PERMISSIONS.RBAC_READ, 'rbac.read:all'),
  validateMiddleware(listRolePermissionsQuerySchema, 'query'),
  rolePermissionController.list,
);

rolePermissionRoutes.post(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.RBAC_CONFIGURE, 'rbac.configure:all'),
  validateMiddleware(assignRolePermissionSchema),
  rolePermissionController.assign,
);

rolePermissionRoutes.delete(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.RBAC_CONFIGURE, 'rbac.configure:all'),
  validateMiddleware(removeRolePermissionSchema),
  rolePermissionController.remove,
);
