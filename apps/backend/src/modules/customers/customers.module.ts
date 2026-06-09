import { Router } from 'express';

import {
  customerAddressRoutes,
  customerConsentRoutes,
  customerEmploymentRoutes,
  customerIncomeRoutes,
  customerPreferencesRoutes,
  customerProfileRoutes,
  customerRoutes,
} from './routes/customer.routes.js';

export function createCustomersModule(): Router {
  const router = Router();
  router.use(customerRoutes);
  return router;
}

export function createCustomerProfilesModule(): Router {
  const router = Router();
  router.use(customerProfileRoutes);
  return router;
}

export function createCustomerAddressesModule(): Router {
  const router = Router();
  router.use(customerAddressRoutes);
  return router;
}

export function createCustomerEmploymentModule(): Router {
  const router = Router();
  router.use(customerEmploymentRoutes);
  return router;
}

export function createCustomerIncomeModule(): Router {
  const router = Router();
  router.use(customerIncomeRoutes);
  return router;
}

export function createCustomerPreferencesModule(): Router {
  const router = Router();
  router.use(customerPreferencesRoutes);
  return router;
}

export function createCustomerConsentsModule(): Router {
  const router = Router();
  router.use(customerConsentRoutes);
  return router;
}
