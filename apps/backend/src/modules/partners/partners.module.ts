import { Router } from 'express';

import { partnerRoutes } from './routes/partner.routes.js';

export function createPartnersModule(): Router {
  const router = Router();
  router.use(partnerRoutes);
  return router;
}
