import { Router } from 'express';

import {
  documentRuleRoutes,
  eligibilityRuleRoutes,
  lenderPolicyRoutes,
  lenderRoutes,
  productFamilyRoutes,
  productLenderMappingRoutes,
  productRoutes,
  productVariantRoutes,
} from './routes/product.routes.js';

export function createProductFamiliesModule(): Router {
  const router = Router();
  router.use(productFamilyRoutes);
  return router;
}

export function createProductsModule(): Router {
  const router = Router();
  router.use(productRoutes);
  return router;
}

export function createProductVariantsModule(): Router {
  const router = Router();
  router.use(productVariantRoutes);
  return router;
}

export function createEligibilityRulesModule(): Router {
  const router = Router();
  router.use(eligibilityRuleRoutes);
  return router;
}

export function createDocumentRulesModule(): Router {
  const router = Router();
  router.use(documentRuleRoutes);
  return router;
}

export function createLendersModule(): Router {
  const router = Router();
  router.use(lenderRoutes);
  return router;
}

export function createLenderPoliciesModule(): Router {
  const router = Router();
  router.use(lenderPolicyRoutes);
  return router;
}

export function createProductLenderMappingsModule(): Router {
  const router = Router();
  router.use(productLenderMappingRoutes);
  return router;
}
