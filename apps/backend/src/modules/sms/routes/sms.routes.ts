import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
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

smsRoutes.post('/otp/send', validateMiddleware(sendSmsOtpSchema), asyncHandler(smsOtpController.send));
smsRoutes.post('/otp/verify', validateMiddleware(verifySmsOtpSchema), asyncHandler(smsOtpController.verify));

smsRoutes.use(authenticateWithSessionMiddleware);

smsRoutes.post('/send', send, validateMiddleware(sendEnterpriseSmsSchema), asyncHandler(smsSendController.send));
smsRoutes.post('/process-queue', configure, asyncHandler(smsSendController.processQueue));

smsRoutes.get('/templates', read, validateMiddleware(listSmsTemplatesQuerySchema, 'query'), asyncHandler(smsTemplateController.list));
smsRoutes.post('/templates', configure, validateMiddleware(createSmsTemplateSchema), asyncHandler(smsTemplateController.create));
smsRoutes.post('/templates/preview', read, validateMiddleware(previewSmsTemplateSchema), asyncHandler(smsTemplateController.preview));
smsRoutes.get('/templates/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(smsTemplateController.getById));
smsRoutes.patch('/templates/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateSmsTemplateSchema), asyncHandler(smsTemplateController.update));
smsRoutes.post('/templates/:id/version', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(createSmsTemplateVersionSchema), asyncHandler(smsTemplateController.createVersion));

smsRoutes.get('/logs', read, validateMiddleware(listSmsLogsQuerySchema, 'query'), asyncHandler(smsLogController.list));
smsRoutes.get('/logs/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(smsLogController.getById));

smsRoutes.get('/analytics', read, validateMiddleware(smsAnalyticsQuerySchema, 'query'), asyncHandler(smsAnalyticsController.summary));

smsRoutes.get('/providers', read, validateMiddleware(listSmsProvidersQuerySchema, 'query'), asyncHandler(smsProviderController.list));
smsRoutes.post('/providers', configure, validateMiddleware(createSmsProviderSchema), asyncHandler(smsProviderController.create));
smsRoutes.get('/providers/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(smsProviderController.getById));
smsRoutes.patch('/providers/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateSmsProviderSchema), asyncHandler(smsProviderController.update));

smsRoutes.get('/preferences', read, validateMiddleware(listSmsPreferencesQuerySchema, 'query'), asyncHandler(smsPreferenceController.list));
smsRoutes.put('/preferences', configure, validateMiddleware(upsertSmsPreferenceSchema), asyncHandler(smsPreferenceController.upsert));

smsRoutes.get('/queue', read, validateMiddleware(listSmsQueueQuerySchema, 'query'), asyncHandler(smsQueueController.list));
