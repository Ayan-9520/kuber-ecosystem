import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { permissionController } from '../controllers/permission.controller.js';
import {
  createPermissionSchema,
  listPermissionsQuerySchema,
  updatePermissionSchema,
  uuidParamSchema,
} from '../validators/permission.validator.js';

export const permissionRoutes: Router = Router();

permissionRoutes.use(authenticateWithSessionMiddleware);

permissionRoutes.get(
  '/',
  requireAnyPermission(
    RBAC_PERMISSIONS.PERMISSIONS_READ,
    RBAC_PERMISSIONS.RBAC_READ,
    'rbac.read:all',
  ),
  validateMiddleware(listPermissionsQuerySchema, 'query'),
  asyncHandler(permissionController.list),
);

permissionRoutes.post(
  '/',
  requireAnyPermission(
    RBAC_PERMISSIONS.PERMISSIONS_WRITE,
    RBAC_PERMISSIONS.RBAC_CONFIGURE,
    'rbac.configure:all',
  ),
  validateMiddleware(createPermissionSchema),
  asyncHandler(permissionController.create),
);

permissionRoutes.get(
  '/:id',
  requireAnyPermission(
    RBAC_PERMISSIONS.PERMISSIONS_READ,
    RBAC_PERMISSIONS.RBAC_READ,
    'rbac.read:all',
  ),
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(permissionController.getById),
);

permissionRoutes.patch(
  '/:id',
  requireAnyPermission(
    RBAC_PERMISSIONS.PERMISSIONS_WRITE,
    RBAC_PERMISSIONS.RBAC_CONFIGURE,
    'rbac.configure:all',
  ),
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updatePermissionSchema),
  asyncHandler(permissionController.update),
);

permissionRoutes.delete(
  '/:id',
  requireAnyPermission(
    RBAC_PERMISSIONS.PERMISSIONS_WRITE,
    RBAC_PERMISSIONS.RBAC_CONFIGURE,
    'rbac.configure:all',
  ),
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(permissionController.remove),
);
