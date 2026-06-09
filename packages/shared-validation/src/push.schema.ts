import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const pushProviderTypeSchema = z.enum(['FCM', 'ONESIGNAL', 'AZURE_NOTIFICATION_HUB', 'MOCK']);
export const pushCategorySchema = z.enum(['AUTH', 'TRANSACTIONAL', 'SUPPORT', 'MARKETING', 'AI', 'REMINDER']);
export const pushPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);
export const pushAppTargetSchema = z.enum(['CUSTOMER', 'DSA', 'EMPLOYEE', 'ALL']);
export const pushDeliveryStatusSchema = z.enum(['QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'DISMISSED', 'FAILED', 'EXPIRED']);
export const pushTopicTypeSchema = z.enum(['BRANCH', 'REGION', 'ROLE', 'CAMPAIGN', 'CUSTOM']);

export const registerPushDeviceSchema = z.object({
  deviceId: z.string().min(1).max(100),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']),
  fcmToken: z.string().max(500).optional(),
  appVersion: z.string().max(20).optional(),
  appTarget: pushAppTargetSchema.default('CUSTOMER'),
});

export const unregisterPushDeviceSchema = z.object({
  deviceId: z.string().min(1).max(100),
  appTarget: pushAppTargetSchema.optional(),
});

export const refreshPushTokenSchema = z.object({
  deviceId: z.string().min(1).max(100),
  fcmToken: z.string().min(1).max(500),
  appTarget: pushAppTargetSchema.default('CUSTOMER'),
});

export const sendEnterprisePushSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string().max(100).optional(),
  templateCode: z.string().max(80).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).optional(),
  payload: z.record(z.unknown()).optional(),
  eventType: z.string().max(50).optional(),
  category: pushCategorySchema.optional(),
  priority: pushPrioritySchema.default('NORMAL'),
  scheduleAt: z.coerce.date().optional(),
  topicCode: z.string().max(80).optional(),
});

export const createPushTopicSchema = z.object({
  code: z.string().min(2).max(80).regex(/^[a-z0-9_]+$/),
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  topicType: pushTopicTypeSchema.default('CUSTOM'),
  appTarget: pushAppTargetSchema.default('ALL'),
  isActive: z.boolean().default(true),
});

export const listPushLogsQuerySchema = paginationSchema.extend({
  status: pushDeliveryStatusSchema.optional(),
  recipientUserId: z.string().uuid().optional(),
  templateCode: z.string().max(80).optional(),
  category: pushCategorySchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'sentAt']).default('createdAt'),
});

export const listPushTemplatesQuerySchema = paginationSchema.extend({
  category: pushCategorySchema.optional(),
  eventType: z.string().max(50).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  locale: z.string().max(10).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['code', 'name', 'createdAt']).default('code'),
});

export const createPushTemplateSchema = z.object({
  code: z.string().min(2).max(80).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  category: pushCategorySchema.default('TRANSACTIONAL'),
  eventType: z.string().max(50).optional(),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(1000),
  variables: z.array(z.string()).default([]),
  locale: z.string().max(10).default('en'),
  metadata: z.record(z.unknown()).optional(),
});

export const updatePushTemplateSchema = createPushTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createPushTemplateVersionSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(1000),
  variables: z.array(z.string()).optional(),
});

export const previewPushTemplateSchema = z.object({
  templateCode: z.string().max(80).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).default({}),
});

export const listPushProvidersQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
});

export const createPushProviderSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(100),
  providerType: pushProviderTypeSchema,
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  config: z.record(z.unknown()).optional(),
  rateLimit: z.coerce.number().int().positive().optional(),
});

export const updatePushProviderSchema = createPushProviderSchema.partial();

export const upsertPushPreferenceSchema = z.object({
  userId: z.string().uuid(),
  pushDeviceId: z.string().uuid().optional(),
  category: pushCategorySchema.optional(),
  eventType: z.string().max(50).optional(),
  enabled: z.boolean(),
  marketingOptIn: z.boolean().optional(),
  doNotDisturb: z.boolean().optional(),
  muteUntil: z.coerce.date().optional(),
});

export const listPushPreferencesQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  category: pushCategorySchema.optional(),
});

export const pushAnalyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  templateId: z.string().uuid().optional(),
  category: pushCategorySchema.optional(),
  providerId: z.string().uuid().optional(),
  topicCode: z.string().max(80).optional(),
});

export const listPushQueueQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  queueType: z.enum(['NOTIFICATION', 'RETRY', 'FAILED', 'PRIORITY', 'SCHEDULED', 'TOPIC']).optional(),
  priority: pushPrioritySchema.optional(),
});

export const listPushTopicsQuerySchema = paginationSchema.extend({
  topicType: pushTopicTypeSchema.optional(),
  appTarget: pushAppTargetSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const trackPushEventSchema = z.object({
  deliveryId: z.string().uuid().optional(),
  providerRef: z.string().max(200).optional(),
  eventType: z.enum(['DELIVERED', 'OPENED', 'CLICKED', 'DISMISSED']),
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterPushDeviceInput = z.infer<typeof registerPushDeviceSchema>;
export type UnregisterPushDeviceInput = z.infer<typeof unregisterPushDeviceSchema>;
export type RefreshPushTokenInput = z.infer<typeof refreshPushTokenSchema>;
export type SendEnterprisePushInput = z.infer<typeof sendEnterprisePushSchema>;
export type ListPushLogsQuery = z.infer<typeof listPushLogsQuerySchema>;
export type ListPushTemplatesQuery = z.infer<typeof listPushTemplatesQuerySchema>;
export type CreatePushTemplateInput = z.infer<typeof createPushTemplateSchema>;
export type UpdatePushTemplateInput = z.infer<typeof updatePushTemplateSchema>;
export type CreatePushTemplateVersionInput = z.infer<typeof createPushTemplateVersionSchema>;
export type PreviewPushTemplateInput = z.infer<typeof previewPushTemplateSchema>;
export type ListPushProvidersQuery = z.infer<typeof listPushProvidersQuerySchema>;
export type CreatePushProviderInput = z.infer<typeof createPushProviderSchema>;
export type UpdatePushProviderInput = z.infer<typeof updatePushProviderSchema>;
export type UpsertPushPreferenceInput = z.infer<typeof upsertPushPreferenceSchema>;
export type ListPushPreferencesQuery = z.infer<typeof listPushPreferencesQuerySchema>;
export type PushAnalyticsQuery = z.infer<typeof pushAnalyticsQuerySchema>;
export type ListPushQueueQuery = z.infer<typeof listPushQueueQuerySchema>;
export type ListPushTopicsQuery = z.infer<typeof listPushTopicsQuerySchema>;
export type TrackPushEventInput = z.infer<typeof trackPushEventSchema>;
