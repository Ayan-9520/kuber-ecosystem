import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
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

pushRoutes.post('/register-device', authenticateWithSessionMiddleware, validateMiddleware(registerPushDeviceSchema), asyncHandler(pushDeviceController.register));
pushRoutes.post('/unregister-device', authenticateWithSessionMiddleware, validateMiddleware(unregisterPushDeviceSchema), asyncHandler(pushDeviceController.unregister));
pushRoutes.post('/refresh-token', authenticateWithSessionMiddleware, validateMiddleware(refreshPushTokenSchema), asyncHandler(pushDeviceController.refreshToken));
pushRoutes.post('/track', validateMiddleware(trackPushEventSchema), asyncHandler(pushSendController.track));

pushRoutes.use(authenticateWithSessionMiddleware);

pushRoutes.get('/', read, validateMiddleware(listPushLogsQuerySchema, 'query'), asyncHandler(pushLogController.list));
pushRoutes.post('/send', send, validateMiddleware(sendEnterprisePushSchema), asyncHandler(pushSendController.send));
pushRoutes.post('/process-queue', configure, asyncHandler(pushSendController.processQueue));

pushRoutes.get('/templates', read, validateMiddleware(listPushTemplatesQuerySchema, 'query'), asyncHandler(pushTemplateController.list));
pushRoutes.post('/templates', configure, validateMiddleware(createPushTemplateSchema), asyncHandler(pushTemplateController.create));
pushRoutes.post('/templates/preview', read, validateMiddleware(previewPushTemplateSchema), asyncHandler(pushTemplateController.preview));
pushRoutes.get('/templates/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(pushTemplateController.getById));
pushRoutes.patch('/templates/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updatePushTemplateSchema), asyncHandler(pushTemplateController.update));
pushRoutes.post('/templates/:id/version', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(createPushTemplateVersionSchema), asyncHandler(pushTemplateController.createVersion));

pushRoutes.get('/logs', read, validateMiddleware(listPushLogsQuerySchema, 'query'), asyncHandler(pushLogController.list));
pushRoutes.get('/logs/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(pushLogController.getById));

pushRoutes.get('/analytics', read, validateMiddleware(pushAnalyticsQuerySchema, 'query'), asyncHandler(pushAnalyticsController.summary));

pushRoutes.get('/providers', read, validateMiddleware(listPushProvidersQuerySchema, 'query'), asyncHandler(pushProviderController.list));
pushRoutes.post('/providers', configure, validateMiddleware(createPushProviderSchema), asyncHandler(pushProviderController.create));
pushRoutes.get('/providers/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(pushProviderController.getById));
pushRoutes.patch('/providers/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updatePushProviderSchema), asyncHandler(pushProviderController.update));

pushRoutes.get('/preferences', read, validateMiddleware(listPushPreferencesQuerySchema, 'query'), asyncHandler(pushPreferenceController.list));
pushRoutes.put('/preferences', configure, validateMiddleware(upsertPushPreferenceSchema), asyncHandler(pushPreferenceController.upsert));

pushRoutes.get('/queue', read, validateMiddleware(listPushQueueQuerySchema, 'query'), asyncHandler(pushQueueController.list));

pushRoutes.get('/topics', read, validateMiddleware(listPushTopicsQuerySchema, 'query'), asyncHandler(pushTopicController.list));
pushRoutes.post('/topics', configure, validateMiddleware(createPushTopicSchema), asyncHandler(pushTopicController.create));
pushRoutes.get('/topics/subscriptions', read, asyncHandler(pushTopicController.subscriptions));
pushRoutes.post('/subscribe', validateMiddleware(subscribePushTopicSchema), asyncHandler(pushTopicController.subscribe));
pushRoutes.post('/unsubscribe', validateMiddleware(subscribePushTopicSchema), asyncHandler(pushTopicController.unsubscribe));
