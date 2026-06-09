import { Router } from 'express';

import {
  aiFinanceRoutes,
  approvalProbabilityRoutes,
  eligibilityCalculateRoutes,
  emiCalculateRoutes,
  financeEngineHistoryRoutes,
  loanComparisonRoutes,
  savingsCalculateRoutes,
} from './routes/finance-engine.routes.js';

export function createEmiCalculateModule(): Router {
  const router = Router();
  router.use(emiCalculateRoutes);
  return router;
}

export function createEligibilityCalculateModule(): Router {
  const router = Router();
  router.use(eligibilityCalculateRoutes);
  return router;
}

export function createSavingsCalculateModule(): Router {
  const router = Router();
  router.use(savingsCalculateRoutes);
  return router;
}

export function createLoanComparisonModule(): Router {
  const router = Router();
  router.use(loanComparisonRoutes);
  return router;
}

export function createApprovalProbabilityModule(): Router {
  const router = Router();
  router.use(approvalProbabilityRoutes);
  return router;
}

export function createFinanceEngineHistoryModule(): Router {
  const router = Router();
  router.use(financeEngineHistoryRoutes);
  return router;
}

export function createAiFinanceModule(): Router {
  const router = Router();
  router.use(aiFinanceRoutes);
  return router;
}

export { financeEngineService } from './services/finance-engine.service.js';
export { aiReadinessService } from './services/ai-readiness.service.js';
