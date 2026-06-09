import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  smsAnalyticsController,
  smsLogController,
  smsOtpController,
  smsPreferenceController,
  smsProviderController,
  smsQueueController,
  smsSendController,
  smsTemplateController,
} from '../controllers/sms.controller.js';
import {
  createSmsProviderSchema,
  createSmsTemplateSchema,
  createSmsTemplateVersionSchema,
  listSmsLogsQuerySchema,
  listSmsPreferencesQuerySchema,
  listSmsProvidersQuerySchema,
  listSmsQueueQuerySchema,
  listSmsTemplatesQuerySchema,
  previewSmsTemplateSchema,
  sendEnterpriseSmsSchema,
  sendSmsOtpSchema,
  smsAnalyticsQuerySchema,
  updateSmsProviderSchema,
  updateSmsTemplateSchema,
  upsertSmsPreferenceSchema,
  verifySmsOtpSchema,
  uuidParamSchema,
} from '../validators/sms.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.SMS_READ, RBAC_PERMISSIONS.NOTIFICATIONS_READ, 'sms.read', 'notifications.read');
const send = requireAnyPermission(RBAC_PERMISSIONS.SMS_SEND, RBAC_PERMISSIONS.NOTIFICATIONS_SEND, 'sms.send', 'notifications.send');
const configure = requireAnyPermission(RBAC_PERMISSIONS.SMS_CONFIGURE, RBAC_PERMISSIONS.NOTIFICATIONS_CONFIGURE, 'sms.configure', 'notifications.configure');

export const smsRoutes = Router();

smsRoutes.post('/otp/send', validateMiddleware(sendSmsOtpSchema), smsOtpController.send);
smsRoutes.post('/otp/verify', validateMiddleware(verifySmsOtpSchema), smsOtpController.verify);

smsRoutes.use(authenticateWithSessionMiddleware);

smsRoutes.post('/send', send, validateMiddleware(sendEnterpriseSmsSchema), smsSendController.send);
smsRoutes.post('/process-queue', configure, smsSendController.processQueue);

smsRoutes.get('/templates', read, validateMiddleware(listSmsTemplatesQuerySchema, 'query'), smsTemplateController.list);
smsRoutes.post('/templates', configure, validateMiddleware(createSmsTemplateSchema), smsTemplateController.create);
smsRoutes.post('/templates/preview', read, validateMiddleware(previewSmsTemplateSchema), smsTemplateController.preview);
smsRoutes.get('/templates/:id', read, validateMiddleware(uuidParamSchema, 'params'), smsTemplateController.getById);
smsRoutes.patch('/templates/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateSmsTemplateSchema), smsTemplateController.update);
smsRoutes.post('/templates/:id/version', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(createSmsTemplateVersionSchema), smsTemplateController.createVersion);

smsRoutes.get('/logs', read, validateMiddleware(listSmsLogsQuerySchema, 'query'), smsLogController.list);
smsRoutes.get('/logs/:id', read, validateMiddleware(uuidParamSchema, 'params'), smsLogController.getById);

smsRoutes.get('/analytics', read, validateMiddleware(smsAnalyticsQuerySchema, 'query'), smsAnalyticsController.summary);

smsRoutes.get('/providers', read, validateMiddleware(listSmsProvidersQuerySchema, 'query'), smsProviderController.list);
smsRoutes.post('/providers', configure, validateMiddleware(createSmsProviderSchema), smsProviderController.create);
smsRoutes.get('/providers/:id', read, validateMiddleware(uuidParamSchema, 'params'), smsProviderController.getById);
smsRoutes.patch('/providers/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateSmsProviderSchema), smsProviderController.update);

smsRoutes.get('/preferences', read, validateMiddleware(listSmsPreferencesQuerySchema, 'query'), smsPreferenceController.list);
smsRoutes.put('/preferences', configure, validateMiddleware(upsertSmsPreferenceSchema), smsPreferenceController.upsert);

smsRoutes.get('/queue', read, validateMiddleware(listSmsQueueQuerySchema, 'query'), smsQueueController.list);
