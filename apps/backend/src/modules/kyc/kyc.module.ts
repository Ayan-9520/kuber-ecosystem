import { Router } from 'express';

import { kycRoutes } from './routes/kyc.routes.js';

export function createKycModule(): Router {
  const router = Router();
  router.use(kycRoutes);
  return router;
}
