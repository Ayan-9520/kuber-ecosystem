import { Router } from 'express';

import { observabilityRoutes } from './routes/observability.routes.js';

export function createObservabilityModule(): Router {
  const router = Router();
  router.use(observabilityRoutes);
  return router;
}

export { observabilityLogService } from './services/observability-log.service.js';
export { observabilityTraceService } from './services/observability-trace.service.js';
export { observabilityErrorService } from './services/observability-error.service.js';
export { observabilityEventService } from './services/observability-event.service.js';
