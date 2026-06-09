import { Router } from 'express';

import {
  applicationRoutes,
  applicationStatusRoutes,
  applicationTimelineRoutes,
  bankLoginRoutes,
  creditReviewRoutes,
  disbursementRoutes,
  eligibilityResultRoutes,
  sanctionRoutes,
} from './routes/application.routes.js';

export function createApplicationsModule(): Router {
  const router = Router();
  router.use(applicationRoutes);
  return router;
}

export function createApplicationStatusModule(): Router {
  const router = Router();
  router.use(applicationStatusRoutes);
  return router;
}

export function createApplicationTimelineModule(): Router {
  const router = Router();
  router.use(applicationTimelineRoutes);
  return router;
}

export function createEligibilityResultsModule(): Router {
  const router = Router();
  router.use(eligibilityResultRoutes);
  return router;
}

export function createBankLoginsModule(): Router {
  const router = Router();
  router.use(bankLoginRoutes);
  return router;
}

export function createCreditReviewsModule(): Router {
  const router = Router();
  router.use(creditReviewRoutes);
  return router;
}

export function createSanctionsModule(): Router {
  const router = Router();
  router.use(sanctionRoutes);
  return router;
}

export function createDisbursementsModule(): Router {
  const router = Router();
  router.use(disbursementRoutes);
  return router;
}
