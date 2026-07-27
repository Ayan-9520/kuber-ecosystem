import { Router } from 'express';

import { loanFulfillmentRoutes } from './routes/loan-fulfillment.routes.js';

export function createLoanFulfillmentModule(): Router {
  const router = Router();
  router.use(loanFulfillmentRoutes);
  return router;
}

export { loanFulfillmentService, computeDistribution } from './services/loan-fulfillment.service.js';
