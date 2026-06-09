import { Router } from 'express';

import { authRoutes } from './routes/auth.routes.js';

export function createAuthModule(): Router {
  const router = Router();
  router.use(authRoutes);
  return router;
}
