import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  pushAnalyticsController,
  pushDeviceController,
  pushLogController,
  pushPreferenceController,
  pushProviderController,
  pushQueueController,
  pushSendController,
  pushTemplateController,
  pushTopicController,
} from '../controllers/push.controller.js';
import {
  createPushProviderSchema,
  createPushTemplateSchema,
  createPushTemplateVersionSchema,
  createPushTopicSchema,
  listPushLogsQuerySchema,
  listPushPreferencesQuerySchema,
  listPushProvidersQuerySchema,
  listPushQueueQuerySchema,
  listPushTemplatesQuerySchema,
  listPushTopicsQuerySchema,
  previewPushTemplateSchema,
  refreshPushTokenSchema,
  registerPushDeviceSchema,
  sendEnterprisePushSchema,
  subscribePushTopicSchema,
  pushAnalyticsQuerySchema,
  trackPushEventSchema,
  unregisterPushDeviceSchema,
  updatePushProviderSchema,
  updatePushTemplateSchema,
  upsertPushPreferenceSchema,
  uuidParamSchema,
} from '../validators/push.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.PUSH_READ, RBAC_PERMISSIONS.NOTIFICATIONS_READ, 'push.read', 'notifications.read');
const send = requireAnyPermission(RBAC_PERMISSIONS.PUSH_SEND, RBAC_PERMISSIONS.NOTIFICATIONS_SEND, 'push.send', 'notifications.send');
const configure = requireAnyPermission(RBAC_PERMISSIONS.PUSH_CONFIGURE, RBAC_PERMISSIONS.NOTIFICATIONS_CONFIGURE, 'push.configure', 'notifications.configure');

export const pushRoutes = Router();

pushRoutes.post('/register-device', authenticateWithSessionMiddleware, validateMiddleware(registerPushDeviceSchema), pushDeviceController.register);
pushRoutes.post('/unregister-device', authenticateWithSessionMiddleware, validateMiddleware(unregisterPushDeviceSchema), pushDeviceController.unregister);
pushRoutes.post('/refresh-token', authenticateWithSessionMiddleware, validateMiddleware(refreshPushTokenSchema), pushDeviceController.refreshToken);
pushRoutes.post('/track', validateMiddleware(trackPushEventSchema), pushSendController.track);

pushRoutes.use(authenticateWithSessionMiddleware);

pushRoutes.get('/', read, validateMiddleware(listPushLogsQuerySchema, 'query'), pushLogController.list);
pushRoutes.post('/send', send, validateMiddleware(sendEnterprisePushSchema), pushSendController.send);
pushRoutes.post('/process-queue', configure, pushSendController.processQueue);

pushRoutes.get('/templates', read, validateMiddleware(listPushTemplatesQuerySchema, 'query'), pushTemplateController.list);
pushRoutes.post('/templates', configure, validateMiddleware(createPushTemplateSchema), pushTemplateController.create);
pushRoutes.post('/templates/preview', read, validateMiddleware(previewPushTemplateSchema), pushTemplateController.preview);
pushRoutes.get('/templates/:id', read, validateMiddleware(uuidParamSchema, 'params'), pushTemplateController.getById);
pushRoutes.patch('/templates/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updatePushTemplateSchema), pushTemplateController.update);
pushRoutes.post('/templates/:id/version', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(createPushTemplateVersionSchema), pushTemplateController.createVersion);

pushRoutes.get('/logs', read, validateMiddleware(listPushLogsQuerySchema, 'query'), pushLogController.list);
pushRoutes.get('/logs/:id', read, validateMiddleware(uuidParamSchema, 'params'), pushLogController.getById);

pushRoutes.get('/analytics', read, validateMiddleware(pushAnalyticsQuerySchema, 'query'), pushAnalyticsController.summary);

pushRoutes.get('/providers', read, validateMiddleware(listPushProvidersQuerySchema, 'query'), pushProviderController.list);
pushRoutes.post('/providers', configure, validateMiddleware(createPushProviderSchema), pushProviderController.create);
pushRoutes.get('/providers/:id', read, validateMiddleware(uuidParamSchema, 'params'), pushProviderController.getById);
pushRoutes.patch('/providers/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updatePushProviderSchema), pushProviderController.update);

pushRoutes.get('/preferences', read, validateMiddleware(listPushPreferencesQuerySchema, 'query'), pushPreferenceController.list);
pushRoutes.put('/preferences', configure, validateMiddleware(upsertPushPreferenceSchema), pushPreferenceController.upsert);

pushRoutes.get('/queue', read, validateMiddleware(listPushQueueQuerySchema, 'query'), pushQueueController.list);

pushRoutes.get('/topics', read, validateMiddleware(listPushTopicsQuerySchema, 'query'), pushTopicController.list);
pushRoutes.post('/topics', configure, validateMiddleware(createPushTopicSchema), pushTopicController.create);
pushRoutes.get('/topics/subscriptions', read, pushTopicController.subscriptions);
pushRoutes.post('/subscribe', validateMiddleware(subscribePushTopicSchema), pushTopicController.subscribe);
pushRoutes.post('/unsubscribe', validateMiddleware(subscribePushTopicSchema), pushTopicController.unsubscribe);
