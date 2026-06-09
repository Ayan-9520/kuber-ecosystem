import { Router } from 'express';

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

emailRoutes.post('/send', send, validateMiddleware(sendEnterpriseEmailSchema), emailSendController.send);
emailRoutes.post('/process-queue', configure, emailSendController.processQueue);

emailRoutes.get('/templates', read, validateMiddleware(listEmailTemplatesQuerySchema, 'query'), emailTemplateController.list);
emailRoutes.post('/templates', configure, validateMiddleware(createEmailTemplateSchema), emailTemplateController.create);
emailRoutes.post('/templates/preview', read, validateMiddleware(previewEmailTemplateSchema), emailTemplateController.preview);
emailRoutes.get('/templates/:id', read, validateMiddleware(uuidParamSchema, 'params'), emailTemplateController.getById);
emailRoutes.patch('/templates/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateEmailTemplateSchema), emailTemplateController.update);
emailRoutes.post('/templates/:id/version', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(createEmailTemplateVersionSchema), emailTemplateController.createVersion);

emailRoutes.get('/logs', read, validateMiddleware(listEmailLogsQuerySchema, 'query'), emailLogController.list);
emailRoutes.get('/logs/:id', read, validateMiddleware(uuidParamSchema, 'params'), emailLogController.getById);

emailRoutes.get('/analytics', read, validateMiddleware(emailAnalyticsQuerySchema, 'query'), emailAnalyticsController.summary);

emailRoutes.get('/providers', read, validateMiddleware(listEmailProvidersQuerySchema, 'query'), emailProviderController.list);
emailRoutes.post('/providers', configure, validateMiddleware(createEmailProviderSchema), emailProviderController.create);
emailRoutes.get('/providers/:id', read, validateMiddleware(uuidParamSchema, 'params'), emailProviderController.getById);
emailRoutes.patch('/providers/:id', configure, validateMiddleware(uuidParamSchema, 'params'), validateMiddleware(updateEmailProviderSchema), emailProviderController.update);

emailRoutes.get('/preferences', read, validateMiddleware(listEmailPreferencesQuerySchema, 'query'), emailPreferenceController.list);
emailRoutes.put('/preferences', configure, validateMiddleware(upsertEmailPreferenceSchema), emailPreferenceController.upsert);

emailRoutes.get('/queue', read, validateMiddleware(listEmailQueueQuerySchema, 'query'), emailQueueController.list);
