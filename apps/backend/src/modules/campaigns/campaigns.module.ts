import { Router } from 'express';

import { campaignRoutes } from './routes/campaign.routes.js';

export function createCampaignsModule(): Router {
  const router = Router();
  router.use(campaignRoutes);
  return router;
}
