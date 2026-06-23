import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  emailAnalyticsController,
  emailLogController,
  emailPreferenceController,
  emailProviderController,
  emailQueueController,
  emailSendController,
  emailTemplateController,
} from '../controllers/email.controller.js';
import {
  createEmailProviderSchema,
  createEmailTemplateSchema,
  createEmailTemplateVersionSchema,
  emailAnalyticsQuerySchema,
  listEmailLogsQuerySchema,
  listEmailPreferencesQuerySchema,
  listEmailProvidersQuerySchema,
  listEmailQueueQuerySchema,
  listEmailTemplatesQuerySchema,
  previewEmailTemplateSchema,
  sendEnterpriseEmailSchema,
  updateEmailProviderSchema,
  updateEmailTemplateSchema,
  upsertEmailPreferenceSchema,
  uuidParamSchema,
} from '../validators/email.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.EMAILS_READ, RBAC_PERMISSIONS.NOTIFICATIONS_READ, 'emails.read', 'notifications.read');
const send = requireAnyPermission(RBAC_PERMISSIONS.EMAILS_SEND, RBAC_PERMISSIONS.NOTIFICATIONS_SEND, 'emails.send', 'notifications.send');
const configure = requireAnyPermission(RBAC_PERMISSIONS.EMAILS_CONFIGURE, RBAC_PERMISSIONS.NOTIFICATIONS_CONFIGURE, 'emails.configure', 'notifications.configure');

export const emailRoutes = Router();
emailRoutes.use(authenticateWithSessionMiddleware);

emailRoutes.post('/send', send, validateMiddleware(sendEnterpriseEmailSchema), asyncHandler(emailSendController.send));
emailRoutes.post('/process-queue', configure, asyncHandler(emailSendController.processQueue));

emailRoutes.get('/templates', read, validateMiddleware(listEmailTemplatesQuerySchema, 'query'), asyncHandler(emailTemplateController.list));
emailRoutes.post('/templates', configure, validateMiddleware(createEmailTemplateSchema), asyncHandler(emailTemplateController.create));
emailRoutes.post('/templates/preview', read, validateMiddleware(previewEmailTemplateSchema), asyncHandler(emailTemplateController.preview));
emailRoutes.get('/templates/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(emailTemplateController.getById));
emailRoutes.patch('/templates/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateEmailTemplateSchema), asyncHandler(emailTemplateController.update));
emailRoutes.post('/templates/:id/version', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(createEmailTemplateVersionSchema), asyncHandler(emailTemplateController.createVersion));

emailRoutes.get('/logs', read, validateMiddleware(listEmailLogsQuerySchema, 'query'), asyncHandler(emailLogController.list));
emailRoutes.get('/logs/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(emailLogController.getById));

emailRoutes.get('/analytics', read, validateMiddleware(emailAnalyticsQuerySchema, 'query'), asyncHandler(emailAnalyticsController.summary));

emailRoutes.get('/providers', read, validateMiddleware(listEmailProvidersQuerySchema, 'query'), asyncHandler(emailProviderController.list));
emailRoutes.post('/providers', configure, validateMiddleware(createEmailProviderSchema), asyncHandler(emailProviderController.create));
emailRoutes.get('/providers/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(emailProviderController.getById));
emailRoutes.patch('/providers/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateEmailProviderSchema), asyncHandler(emailProviderController.update));

emailRoutes.get('/preferences', read, validateMiddleware(listEmailPreferencesQuerySchema, 'query'), asyncHandler(emailPreferenceController.list));
emailRoutes.put('/preferences', configure, validateMiddleware(upsertEmailPreferenceSchema), asyncHandler(emailPreferenceController.upsert));

emailRoutes.get('/queue', read, validateMiddleware(listEmailQueueQuerySchema, 'query'), asyncHandler(emailQueueController.list));
