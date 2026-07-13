import { Router } from 'express';

import { partnerBrandRoutes, publicPartnerBrandRoutes } from './routes/partner-brand.routes.js';

export function createPartnerBrandingModule(): Router {
  const router = Router();
  router.use('/partner-branding', partnerBrandRoutes);
  return router;
}

export function createPublicProfessionalsModule(): Router {
  const router = Router();
  router.use('/public/professionals', publicPartnerBrandRoutes);
  return router;
}
