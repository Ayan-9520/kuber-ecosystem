import { z } from 'zod';

export {
  bulkUpsertPreferencesSchema,
  createCommunicationProviderSchema,
  createNotificationTemplateSchema,
  createTemplateVersionSchema,
  listCommunicationLogsQuerySchema,
  listCommunicationProvidersQuerySchema,
  listChannelLogsQuerySchema,
  listDeadLettersQuerySchema,
  listNotificationPreferencesQuerySchema,
  listNotificationsQuerySchema,
  listNotificationTemplatesQuerySchema,
  listQueueQuerySchema,
  notificationAnalyticsQuerySchema,
  registerDeviceSchema,
  sendEmailSchema,
  sendNotificationSchema,
  sendPushSchema,
  sendPushTopicSchema,
  sendSmsSchema,
  sendWhatsAppSchema,
  subscribePushTopicSchema,
  updateCommunicationProviderSchema,
  updateNotificationTemplateSchema,
  upsertNotificationPreferenceSchema,
} from '@kuberone/shared-validation';

export const uuidParamSchema = z.object({ id: z.string().uuid() });
export const userIdParamSchema = z.object({ userId: z.string().uuid() });
