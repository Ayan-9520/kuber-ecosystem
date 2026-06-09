import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  communicationLogController,
  emailController,
  notificationController,
  notificationPreferenceController,
  notificationTemplateController,
  pushController,
  smsController,
  whatsAppController,
} from '../controllers/notification.controller.js';
import {
  bulkUpsertPreferencesSchema,
  createNotificationTemplateSchema,
  createTemplateVersionSchema,
  listCommunicationLogsQuerySchema,
  listChannelLogsQuerySchema,
  listNotificationPreferencesQuerySchema,
  listNotificationsQuerySchema,
  listNotificationTemplatesQuerySchema,
  notificationAnalyticsQuerySchema,
  registerDeviceSchema,
  sendEmailSchema,
  sendNotificationSchema,
  sendPushSchema,
  sendSmsSchema,
  sendWhatsAppSchema,
  updateNotificationTemplateSchema,
  upsertNotificationPreferenceSchema,
  userIdParamSchema,
  uuidParamSchema,
} from '../validators/notification.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_READ, 'notifications.read');
const write = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_WRITE, 'notifications.write');
const send = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_SEND, 'notifications.send', RBAC_PERMISSIONS.NOTIFICATIONS_WRITE);
const configure = requireAnyPermission(RBAC_PERMISSIONS.NOTIFICATIONS_CONFIGURE, 'notifications.configure', RBAC_PERMISSIONS.NOTIFICATIONS_WRITE);

export const notificationRoutes = Router();
notificationRoutes.use(authenticateWithSessionMiddleware);
notificationRoutes.get('/', read, validateMiddleware(listNotificationsQuerySchema, 'query'), notificationController.list);
notificationRoutes.post('/send', send, validateMiddleware(sendNotificationSchema), notificationController.send);
notificationRoutes.post('/process-queue', configure, notificationController.processQueue);
notificationRoutes.post('/users/:userId/read-all', write, validateMiddleware(userIdParamSchema, 'params'), notificationController.markAllRead);
notificationRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), notificationController.getById);
notificationRoutes.post('/:id/read', write, validateMiddleware(uuidParamSchema, 'params'), notificationController.markRead);
notificationRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), notificationController.remove);

export const notificationTemplateRoutes = Router();
notificationTemplateRoutes.use(authenticateWithSessionMiddleware);
notificationTemplateRoutes.get('/', read, validateMiddleware(listNotificationTemplatesQuerySchema, 'query'), notificationTemplateController.list);
notificationTemplateRoutes.post('/', configure, validateMiddleware(createNotificationTemplateSchema), notificationTemplateController.create);
notificationTemplateRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), notificationTemplateController.getById);
notificationTemplateRoutes.patch(
  '/:id',
  configure,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateNotificationTemplateSchema),
  notificationTemplateController.update,
);
notificationTemplateRoutes.post(
  '/:id/version',
  configure,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(createTemplateVersionSchema),
  notificationTemplateController.createVersion,
);
notificationTemplateRoutes.delete('/:id', configure, validateMiddleware(uuidParamSchema, 'params'), notificationTemplateController.remove);

export const notificationPreferenceRoutes = Router();
notificationPreferenceRoutes.use(authenticateWithSessionMiddleware);
notificationPreferenceRoutes.get('/', read, validateMiddleware(listNotificationPreferencesQuerySchema, 'query'), notificationPreferenceController.list);
notificationPreferenceRoutes.put('/', write, validateMiddleware(upsertNotificationPreferenceSchema), notificationPreferenceController.upsert);
notificationPreferenceRoutes.put('/bulk', write, validateMiddleware(bulkUpsertPreferencesSchema), notificationPreferenceController.bulkUpsert);

export const emailRoutes = Router();
emailRoutes.use(authenticateWithSessionMiddleware);
emailRoutes.get('/', read, validateMiddleware(listChannelLogsQuerySchema, 'query'), emailController.list);
emailRoutes.post('/send', send, validateMiddleware(sendEmailSchema), emailController.send);
emailRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), emailController.getById);

export const smsRoutes = Router();
smsRoutes.use(authenticateWithSessionMiddleware);
smsRoutes.get('/', read, validateMiddleware(listChannelLogsQuerySchema, 'query'), smsController.list);
smsRoutes.post('/send', send, validateMiddleware(sendSmsSchema), smsController.send);
smsRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), smsController.getById);

export const whatsAppRoutes = Router();
whatsAppRoutes.use(authenticateWithSessionMiddleware);
whatsAppRoutes.get('/', read, validateMiddleware(listChannelLogsQuerySchema, 'query'), whatsAppController.list);
whatsAppRoutes.post('/send', send, validateMiddleware(sendWhatsAppSchema), whatsAppController.send);
whatsAppRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), whatsAppController.getById);

export const pushRoutes = Router();
pushRoutes.use(authenticateWithSessionMiddleware);
pushRoutes.get('/', read, validateMiddleware(listChannelLogsQuerySchema, 'query'), pushController.list);
pushRoutes.post('/send', send, validateMiddleware(sendPushSchema), pushController.send);
pushRoutes.post('/register-device', write, validateMiddleware(registerDeviceSchema), pushController.registerDevice);
pushRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), pushController.getById);

export const communicationLogRoutes = Router();
communicationLogRoutes.use(authenticateWithSessionMiddleware);
communicationLogRoutes.get('/analytics', read, validateMiddleware(notificationAnalyticsQuerySchema, 'query'), communicationLogController.analytics);
communicationLogRoutes.get('/', read, validateMiddleware(listCommunicationLogsQuerySchema, 'query'), communicationLogController.list);
communicationLogRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), communicationLogController.getById);
