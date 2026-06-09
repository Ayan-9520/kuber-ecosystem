import { Router } from 'express';

import { permissionRoutes } from './routes/permission.routes.js';

export function createPermissionsModule(): Router {
  const router = Router();
  router.use(permissionRoutes);
  return router;
}
