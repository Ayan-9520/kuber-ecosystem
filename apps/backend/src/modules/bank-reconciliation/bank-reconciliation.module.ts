import { Router } from 'express';

import { bankReconciliationRoutes } from './routes/bank-reconciliation.routes.js';

export function createBankReconciliationModule(): Router {
  const router = Router();
  router.use(bankReconciliationRoutes);
  return router;
}

export { bankReconciliationService } from './services/bank-reconciliation.service.js';
