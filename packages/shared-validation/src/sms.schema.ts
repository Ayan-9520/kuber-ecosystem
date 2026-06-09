import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const smsProviderTypeSchema = z.enum(['MSG91', 'TWILIO', 'AWS_SNS', 'MOCK']);
export const smsCategorySchema = z.enum(['OTP', 'TRANSACTIONAL', 'SUPPORT', 'COMPLIANCE', 'MARKETING']);
export const smsPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);
export const smsDeliveryStatusSchema = z.enum(['QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'EXPIRED', 'REJECTED']);

export const sendEnterpriseSmsSchema = z.object({
  toPhone: z.string().min(10).max(15),
  userId: z.string().uuid().optional(),
  templateCode: z.string().max(80).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).optional(),
  eventType: z.string().max(50).optional(),
  category: smsCategorySchema.optional(),
  priority: smsPrioritySchema.default('NORMAL'),
  scheduleAt: z.coerce.date().optional(),
  isOtp: z.boolean().optional(),
  otpPurpose: z.string().max(30).optional(),
});

export const sendSmsOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  purpose: z.enum(['LOGIN', 'REGISTER', 'VERIFY_MOBILE', 'PASSWORD_RESET', 'KYC_AADHAAR', 'CHANGE_MOBILE']),
});

export const verifySmsOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
  purpose: z.enum(['LOGIN', 'REGISTER', 'VERIFY_MOBILE', 'PASSWORD_RESET', 'KYC_AADHAAR', 'CHANGE_MOBILE']),
  device: z
    .object({
      deviceId: z.string().max(100),
      platform: z.enum(['IOS', 'ANDROID', 'WEB']),
      fcmToken: z.string().max(500).optional(),
      appVersion: z.string().max(20).optional(),
    })
    .optional(),
});

export const listSmsLogsQuerySchema = paginationSchema.extend({
  status: smsDeliveryStatusSchema.optional(),
  recipientUserId: z.string().uuid().optional(),
  templateCode: z.string().max(80).optional(),
  category: smsCategorySchema.optional(),
  isOtp: z.coerce.boolean().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'sentAt']).default('createdAt'),
});

export const listSmsTemplatesQuerySchema = paginationSchema.extend({
  category: smsCategorySchema.optional(),
  eventType: z.string().max(50).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  locale: z.string().max(10).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['code', 'name', 'createdAt']).default('code'),
});

export const createSmsTemplateSchema = z.object({
  code: z.string().min(2).max(80).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  category: smsCategorySchema.default('TRANSACTIONAL'),
  eventType: z.string().max(50).optional(),
  body: z.string().min(1).max(1000),
  dltTemplateId: z.string().max(50).optional(),
  variables: z.array(z.string()).default([]),
  locale: z.string().max(10).default('en'),
  metadata: z.record(z.unknown()).optional(),
});

export const updateSmsTemplateSchema = createSmsTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createSmsTemplateVersionSchema = z.object({
  body: z.string().min(1).max(1000),
  dltTemplateId: z.string().max(50).optional(),
  variables: z.array(z.string()).optional(),
});

export const previewSmsTemplateSchema = z.object({
  templateCode: z.string().max(80).optional(),
  body: z.string().max(1000).optional(),
  variables: z.record(z.unknown()).default({}),
});

export const listSmsProvidersQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
});

export const createSmsProviderSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(100),
  providerType: smsProviderTypeSchema,
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  config: z.record(z.unknown()).optional(),
  rateLimit: z.coerce.number().int().positive().optional(),
});

export const updateSmsProviderSchema = createSmsProviderSchema.partial();

export const upsertSmsPreferenceSchema = z.object({
  userId: z.string().uuid(),
  category: smsCategorySchema.optional(),
  eventType: z.string().max(50).optional(),
  enabled: z.boolean(),
  marketingOptIn: z.boolean().optional(),
});

export const listSmsPreferencesQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  category: smsCategorySchema.optional(),
});

export const smsAnalyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  templateId: z.string().uuid().optional(),
  category: smsCategorySchema.optional(),
  providerId: z.string().uuid().optional(),
});

export const listSmsQueueQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  queueType: z.enum(['NOTIFICATION', 'RETRY', 'FAILED', 'PRIORITY', 'SCHEDULED', 'OTP']).optional(),
  priority: smsPrioritySchema.optional(),
});

export type SendEnterpriseSmsInput = z.infer<typeof sendEnterpriseSmsSchema>;
export type SendSmsOtpInput = z.infer<typeof sendSmsOtpSchema>;
export type VerifySmsOtpInput = z.infer<typeof verifySmsOtpSchema>;
export type ListSmsLogsQuery = z.infer<typeof listSmsLogsQuerySchema>;
export type ListSmsTemplatesQuery = z.infer<typeof listSmsTemplatesQuerySchema>;
export type CreateSmsTemplateInput = z.infer<typeof createSmsTemplateSchema>;
export type UpdateSmsTemplateInput = z.infer<typeof updateSmsTemplateSchema>;
export type CreateSmsTemplateVersionInput = z.infer<typeof createSmsTemplateVersionSchema>;
export type PreviewSmsTemplateInput = z.infer<typeof previewSmsTemplateSchema>;
export type ListSmsProvidersQuery = z.infer<typeof listSmsProvidersQuerySchema>;
export type CreateSmsProviderInput = z.infer<typeof createSmsProviderSchema>;
export type UpdateSmsProviderInput = z.infer<typeof updateSmsProviderSchema>;
export type UpsertSmsPreferenceInput = z.infer<typeof upsertSmsPreferenceSchema>;
export type ListSmsPreferencesQuery = z.infer<typeof listSmsPreferencesQuerySchema>;
export type SmsAnalyticsQuery = z.infer<typeof smsAnalyticsQuerySchema>;
export type ListSmsQueueQuery = z.infer<typeof listSmsQueueQuerySchema>;
