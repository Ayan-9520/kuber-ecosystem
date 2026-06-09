import { Router } from 'express';

import { smsRoutes } from './routes/sms.routes.js';

export function createSmsModule(): Router {
  const router = Router();
  router.use(smsRoutes);
  return router;
}

export { smsOrchestratorService } from './services/sms-orchestrator.service.js';
export { smsWorkerService } from './services/sms-worker.service.js';
export { smsWebhookService } from './services/sms-webhook.service.js';
export { smsOtpService } from './services/sms-otp.service.js';
export { smsTemplateService } from './services/sms-template.service.js';
