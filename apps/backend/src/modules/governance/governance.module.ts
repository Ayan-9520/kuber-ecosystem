import { Router } from 'express';

import { auditCenterRoutes } from './routes/audit-center.routes.js';
import { complianceRoutes } from './routes/compliance.routes.js';
import { riskRoutes } from './routes/risk.routes.js';
import { securityRoutes } from './routes/security.routes.js';

export function createAuditCenterModule(): Router {
  const router = Router();
  router.use(auditCenterRoutes);
  return router;
}

export function createComplianceModule(): Router {
  const router = Router();
  router.use(complianceRoutes);
  return router;
}

export function createRiskModule(): Router {
  const router = Router();
  router.use(riskRoutes);
  return router;
}

export function createSecurityModule(): Router {
  const router = Router();
  router.use(securityRoutes);
  return router;
}

export { centralAuditService } from './services/central-audit.service.js';
