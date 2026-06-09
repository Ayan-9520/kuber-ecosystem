import { Router } from 'express';

import { referralRoutes, referralTypeRoutes } from './routes/referral.routes.js';

export function createReferralsModule(): Router {
  const router = Router();
  router.use(referralRoutes);
  return router;
}

export function createReferralTypesModule(): Router {
  const router = Router();
  router.use(referralTypeRoutes);
  return router;
}

export { referralService } from './services/referral.service.js';
export { referralTypeService } from './services/referral-type.service.js';
