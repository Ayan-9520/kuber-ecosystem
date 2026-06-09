import { Router } from 'express';

import {
  commissionAdjustmentRoutes,
  commissionAnalyticsRoutes,
  commissionApprovalRoutes,
  commissionLedgerRoutes,
  commissionPaymentRoutes,
  commissionRecoveryRoutes,
  commissionRuleRoutes,
} from './routes/commission.routes.js';

export function createCommissionRulesModule(): Router {
  const router = Router();
  router.use(commissionRuleRoutes);
  return router;
}

export function createCommissionLedgerModule(): Router {
  const router = Router();
  router.use(commissionLedgerRoutes);
  return router;
}

export function createCommissionApprovalsModule(): Router {
  const router = Router();
  router.use(commissionApprovalRoutes);
  return router;
}

export function createCommissionPaymentsModule(): Router {
  const router = Router();
  router.use(commissionPaymentRoutes);
  return router;
}

export function createCommissionAdjustmentsModule(): Router {
  const router = Router();
  router.use(commissionAdjustmentRoutes);
  return router;
}

export function createCommissionRecoveriesModule(): Router {
  const router = Router();
  router.use(commissionRecoveryRoutes);
  return router;
}

export function createCommissionAnalyticsModule(): Router {
  const router = Router();
  router.use(commissionAnalyticsRoutes);
  return router;
}

export { commissionCalculationEngineService } from './services/commission-calculation-engine.service.js';
export { commissionPayoutEngineService } from './services/commission-payout-engine.service.js';
export { commissionLedgerService } from './services/commission-ledger.service.js';
