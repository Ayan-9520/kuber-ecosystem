import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  deadLetterController,
  notificationQueueController,
  providerConfigController,
  pushTopicController,
  webhookController,
} from '../controllers/communication-channels.controller.js';
import {
  createCommunicationProviderSchema,
  listCommunicationProvidersQuerySchema,
  listDeadLettersQuerySchema,
  listQueueQuerySchema,
  sendPushTopicSchema,
  subscribePushTopicSchema,
  updateCommunicationProviderSchema,
  uuidParamSchema,
} from '../validators/notification.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_READ, 'notifications.read');
const configure = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_CONFIGURE, 'notifications.configure', RBAC_PERMISSIONS.NOTIFICATIONS_WRITE);
const send = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_SEND, 'notifications.send', RBAC_PERMISSIONS.NOTIFICATIONS_WRITE);

export const communicationProviderRoutes = Router();
communicationProviderRoutes.use(authenticateWithSessionMiddleware);
communicationProviderRoutes.get('/', read, validateMiddleware(listCommunicationProvidersQuerySchema, 'query'), providerConfigController.list);
communicationProviderRoutes.post('/', configure, validateMiddleware(createCommunicationProviderSchema), providerConfigController.create);
communicationProviderRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), providerConfigController.getById);
communicationProviderRoutes.patch(
  '/:id',
  configure,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCommunicationProviderSchema),
  providerConfigController.update,
);

export const deadLetterRoutes = Router();
deadLetterRoutes.use(authenticateWithSessionMiddleware);
deadLetterRoutes.get('/', read, validateMiddleware(listDeadLettersQuerySchema, 'query'), deadLetterController.list);
deadLetterRoutes.post('/:id/resolve', configure, validateMiddleware(uuidParamSchema, 'params'), deadLetterController.resolve);

export const notificationQueueRoutes = Router();
notificationQueueRoutes.use(authenticateWithSessionMiddleware);
notificationQueueRoutes.get('/', read, validateMiddleware(listQueueQuerySchema, 'query'), notificationQueueController.list);

export const pushTopicRoutes = Router();
pushTopicRoutes.use(authenticateWithSessionMiddleware);
pushTopicRoutes.get('/subscriptions', read, pushTopicController.listSubscriptions);
pushTopicRoutes.post('/subscribe', validateMiddleware(subscribePushTopicSchema), pushTopicController.subscribe);
pushTopicRoutes.post('/unsubscribe', validateMiddleware(subscribePushTopicSchema), pushTopicController.unsubscribe);
pushTopicRoutes.post('/send', send, validateMiddleware(sendPushTopicSchema), pushTopicController.sendToTopic);

export const webhookRoutes = Router();
webhookRoutes.get('/whatsapp', webhookController.whatsapp);
webhookRoutes.post('/whatsapp', webhookController.whatsapp);
webhookRoutes.post('/sendgrid', webhookController.sendgrid);
webhookRoutes.post('/sms-dlr', webhookController.smsDlr);
