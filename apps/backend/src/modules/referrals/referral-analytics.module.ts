import { Router } from 'express';

import { referralAnalyticsRoutes } from './routes/referral-analytics.routes.js';

export function createReferralAnalyticsModule(): Router {
  const router = Router();
  router.use(referralAnalyticsRoutes);
  return router;
}
