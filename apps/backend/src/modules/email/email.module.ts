import { Router } from 'express';

import { emailRoutes } from './routes/email.routes.js';

export function createEmailModule(): Router {
  const router = Router();
  router.use(emailRoutes);
  return router;
}

export { emailOrchestratorService } from './services/email-orchestrator.service.js';
export { emailWorkerService } from './services/email-worker.service.js';
export { emailWebhookService } from './services/email-webhook.service.js';
export { emailTemplateService } from './services/email-template.service.js';
