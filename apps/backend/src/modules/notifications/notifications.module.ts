import { Router } from 'express';

import {
  communicationProviderRoutes,
  deadLetterRoutes,
  notificationQueueRoutes,
  pushTopicRoutes,
  webhookRoutes,
} from './routes/communication-channels.routes.js';
import {
  communicationLogRoutes,
  emailRoutes,
  notificationPreferenceRoutes,
  notificationRoutes,
  notificationTemplateRoutes,
  pushRoutes,
  whatsAppRoutes,
} from './routes/notification.routes.js';

export function createNotificationsModule(): Router {
  const router = Router();
  router.use(notificationRoutes);
  return router;
}

export function createNotificationTemplatesModule(): Router {
  const router = Router();
  router.use(notificationTemplateRoutes);
  return router;
}

export function createNotificationPreferencesModule(): Router {
  const router = Router();
  router.use(notificationPreferenceRoutes);
  return router;
}

export function createEmailsModule(): Router {
  const router = Router();
  router.use(emailRoutes);
  return router;
}

export function createLegacyPushModule(): Router {
  const router = Router();
  router.use(pushRoutes);
  return router;
}

export function createWhatsAppModule(): Router {
  const router = Router();
  router.use(whatsAppRoutes);
  return router;
}

export function createCommunicationLogsModule(): Router {
  const router = Router();
  router.use(communicationLogRoutes);
  return router;
}

export function createCommunicationProvidersModule(): Router {
  const router = Router();
  router.use(communicationProviderRoutes);
  return router;
}

export function createDeadLetterModule(): Router {
  const router = Router();
  router.use(deadLetterRoutes);
  return router;
}

export function createNotificationQueueModule(): Router {
  const router = Router();
  router.use(notificationQueueRoutes);
  return router;
}

export function createPushTopicsModule(): Router {
  const router = Router();
  router.use(pushTopicRoutes);
  return router;
}

export function createNotificationWebhooksModule(): Router {
  const router = Router();
  router.use(webhookRoutes);
  return router;
}

export { notificationDispatchService } from './services/notification-dispatch.service.js';
export { notificationService } from './services/notification.service.js';
export { notificationWorkerService } from './services/notification-worker.service.js';
