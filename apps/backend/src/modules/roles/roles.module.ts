import { Router } from 'express';

import { rolePermissionRoutes, roleRoutes } from './routes/role.routes.js';

export function createRolesModule(): Router {
  const router = Router();
  router.use(roleRoutes);
  return router;
}

export function createRolePermissionsModule(): Router {
  const router = Router();
  router.use(rolePermissionRoutes);
  return router;
}
