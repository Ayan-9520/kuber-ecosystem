import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const notificationChannelSchema = z.enum(['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH']);

export const notificationEventTypeSchema = z.enum([
  'LEAD_CREATED',
  'LEAD_ASSIGNED',
  'LEAD_QUALIFIED',
  'APPLICATION_CREATED',
  'APPLICATION_SUBMITTED',
  'DOCUMENT_REQUESTED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_VERIFIED',
  'DOCUMENT_REJECTED',
  'ELIGIBILITY_GENERATED',
  'SANCTION_ISSUED',
  'DISBURSEMENT_COMPLETED',
  'REFERRAL_CREATED',
  'REFERRAL_CONVERTED',
  'REWARD_APPROVED',
  'COMMISSION_APPROVED',
  'COMMISSION_PAID',
  'SUPPORT_TICKET_CREATED',
  'SUPPORT_TICKET_CLOSED',
  'LOGIN_OTP',
  'PASSWORD_RESET',
]);

export const communicationStatusSchema = z.enum([
  'PENDING',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'FAILED',
  'CANCELLED',
]);

export const listNotificationsQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  eventType: notificationEventTypeSchema.optional(),
  channel: notificationChannelSchema.optional(),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED']).optional(),
  unreadOnly: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'readAt']).default('createdAt'),
});

export const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  eventType: notificationEventTypeSchema,
  channels: z.array(notificationChannelSchema).min(1).default(['IN_APP']),
  templateCode: z.string().max(50).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(5000).optional(),
  variables: z.record(z.unknown()).optional(),
  payload: z.record(z.unknown()).optional(),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  scheduleAt: z.coerce.date().optional(),
});

export const markNotificationReadSchema = z.object({
  read: z.boolean().default(true),
});

export const listNotificationTemplatesQuerySchema = paginationSchema.extend({
  channel: notificationChannelSchema.optional(),
  eventType: notificationEventTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['code', 'version', 'createdAt']).default('code'),
});

export const createNotificationTemplateSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  channel: notificationChannelSchema,
  eventType: notificationEventTypeSchema,
  subject: z.string().max(500).optional(),
  body: z.string().min(1).max(10000),
  variables: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export const updateNotificationTemplateSchema = createNotificationTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createTemplateVersionSchema = z.object({
  subject: z.string().max(500).optional(),
  body: z.string().min(1).max(10000),
  variables: z.array(z.string()).optional(),
});

export const listNotificationPreferencesQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  eventType: notificationEventTypeSchema.optional(),
  channel: notificationChannelSchema.optional(),
});

export const upsertNotificationPreferenceSchema = z.object({
  userId: z.string().uuid(),
  eventType: notificationEventTypeSchema,
  channel: notificationChannelSchema,
  enabled: z.boolean(),
});

export const bulkUpsertPreferencesSchema = z.object({
  userId: z.string().uuid(),
  preferences: z.array(
    z.object({
      eventType: notificationEventTypeSchema,
      channel: notificationChannelSchema,
      enabled: z.boolean(),
    }),
  ),
});

export const sendEmailSchema = z.object({
  userId: z.string().uuid().optional(),
  toEmail: z.string().email(),
  templateCode: z.string().max(50).optional(),
  subject: z.string().max(500).optional(),
  body: z.string().max(10000).optional(),
  variables: z.record(z.unknown()).optional(),
  eventType: notificationEventTypeSchema.optional(),
});

export const sendSmsSchema = z.object({
  userId: z.string().uuid().optional(),
  toPhone: z.string().min(10).max(15),
  templateCode: z.string().max(50).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).optional(),
  eventType: notificationEventTypeSchema.optional(),
});

export const sendWhatsAppSchema = z.object({
  userId: z.string().uuid().optional(),
  toPhone: z.string().min(10).max(15),
  templateCode: z.string().max(50).optional(),
  templateName: z.string().max(100).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).optional(),
  eventType: notificationEventTypeSchema.optional(),
});

export const sendPushSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  templateCode: z.string().max(50).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).optional(),
  payload: z.record(z.unknown()).optional(),
  eventType: notificationEventTypeSchema.optional(),
});

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1).max(100),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']),
  fcmToken: z.string().max(500).optional(),
  appVersion: z.string().max(20).optional(),
});

export const listCommunicationLogsQuerySchema = paginationSchema.extend({
  channel: notificationChannelSchema.optional(),
  eventType: notificationEventTypeSchema.optional(),
  status: communicationStatusSchema.optional(),
  recipientUserId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'sentAt']).default('createdAt'),
});

export const listChannelLogsQuerySchema = paginationSchema.extend({
  status: communicationStatusSchema.optional(),
  recipientUserId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'sentAt']).default('createdAt'),
});

export const notificationAnalyticsQuerySchema = z.object({
  channel: notificationChannelSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const communicationProviderTypeSchema = z.enum(['SMTP', 'SENDGRID', 'MSG91', 'TWILIO', 'META_WHATSAPP', 'FCM', 'MOCK']);

export const listCommunicationProvidersQuerySchema = paginationSchema.extend({
  channel: notificationChannelSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createCommunicationProviderSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(100),
  channel: notificationChannelSchema,
  providerType: communicationProviderTypeSchema,
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  config: z.record(z.unknown()).optional(),
  rateLimit: z.coerce.number().int().positive().optional(),
});

export const updateCommunicationProviderSchema = createCommunicationProviderSchema.partial();

export const listDeadLettersQuerySchema = paginationSchema.extend({
  channel: notificationChannelSchema.optional(),
  resolved: z.coerce.boolean().optional(),
});

export const subscribePushTopicSchema = z.object({
  topicCode: z.string().min(2).max(80),
  deviceId: z.string().max(100).optional(),
});

export const sendPushTopicSchema = z.object({
  topicCode: z.string().min(2).max(80),
  templateCode: z.string().max(50).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).optional(),
  payload: z.record(z.unknown()).optional(),
  eventType: notificationEventTypeSchema.optional(),
});

export const listQueueQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SCHEDULED']).optional(),
  channel: notificationChannelSchema.optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type ListNotificationTemplatesQuery = z.infer<typeof listNotificationTemplatesQuerySchema>;
export type CreateNotificationTemplateInput = z.infer<typeof createNotificationTemplateSchema>;
export type UpdateNotificationTemplateInput = z.infer<typeof updateNotificationTemplateSchema>;
export type CreateTemplateVersionInput = z.infer<typeof createTemplateVersionSchema>;
export type UpsertNotificationPreferenceInput = z.infer<typeof upsertNotificationPreferenceSchema>;
export type BulkUpsertPreferencesInput = z.infer<typeof bulkUpsertPreferencesSchema>;
export type ListNotificationPreferencesQuery = z.infer<typeof listNotificationPreferencesQuerySchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type SendWhatsAppInput = z.infer<typeof sendWhatsAppSchema>;
export type SendPushInput = z.infer<typeof sendPushSchema>;
export type ListCommunicationLogsQuery = z.infer<typeof listCommunicationLogsQuerySchema>;
export type ListChannelLogsQuery = z.infer<typeof listChannelLogsQuerySchema>;
export type NotificationAnalyticsQuery = z.infer<typeof notificationAnalyticsQuerySchema>;
export type ListCommunicationProvidersQuery = z.infer<typeof listCommunicationProvidersQuerySchema>;
export type CreateCommunicationProviderInput = z.infer<typeof createCommunicationProviderSchema>;
export type UpdateCommunicationProviderInput = z.infer<typeof updateCommunicationProviderSchema>;
export type ListDeadLettersQuery = z.infer<typeof listDeadLettersQuerySchema>;
export type SubscribePushTopicInput = z.infer<typeof subscribePushTopicSchema>;
export type SendPushTopicInput = z.infer<typeof sendPushTopicSchema>;
