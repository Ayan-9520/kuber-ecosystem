import type { Router } from 'express';

import { authenticateWithSessionMiddleware } from '../middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../middleware/rbac.middleware.js';

export function protectStubRoute(router: Router, permission: string): void {
  router.use(authenticateWithSessionMiddleware);
  router.use(requireAnyPermission(permission));
}
