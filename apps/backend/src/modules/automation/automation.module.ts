import { Router } from 'express';

import { automationRoutes } from './routes/automation.routes.js';

export function createAutomationModule(): Router {
  const router = Router();
  router.use(automationRoutes);
  return router;
}

export { automationWorkerService } from './services/automation-worker.service.js';
export { automationTriggerService } from './services/automation-trigger.service.js';
