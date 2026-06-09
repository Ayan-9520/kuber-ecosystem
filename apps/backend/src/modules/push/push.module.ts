import { Router } from 'express';

import { pushRoutes } from './routes/push.routes.js';

export function createEnterprisePushModule(): Router {
  const router = Router();
  router.use(pushRoutes);
  return router;
}

export { pushOrchestratorService } from './services/push-orchestrator.service.js';
export { pushWorkerService } from './services/push-worker.service.js';
export { pushDeviceService } from './services/push-device.service.js';
export { pushTopicService } from './services/push-topic.service.js';
export { pushTemplateService } from './services/push-template.service.js';
