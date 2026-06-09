import { Router } from 'express';

import { userRoleRoutes, userRoutes } from './routes/user.routes.js';

export function createUsersModule(): Router {
  const router = Router();
  router.use(userRoutes);
  return router;
}

export function createUserRolesModule(): Router {
  const router = Router();
  router.use(userRoleRoutes);
  return router;
}
