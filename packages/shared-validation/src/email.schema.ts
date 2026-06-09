import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const emailProviderTypeSchema = z.enum(['SMTP', 'SENDGRID', 'AWS_SES', 'MOCK']);
export const emailCategorySchema = z.enum(['TRANSACTIONAL', 'MARKETING', 'SYSTEM', 'SUPPORT', 'COMPLIANCE']);
export const emailPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);
export const emailDeliveryStatusSchema = z.enum(['QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED']);

export const sendEnterpriseEmailSchema = z.object({
  toEmail: z.string().email(),
  userId: z.string().uuid().optional(),
  templateCode: z.string().max(80).optional(),
  subject: z.string().max(500).optional(),
  htmlBody: z.string().max(100_000).optional(),
  textBody: z.string().max(50_000).optional(),
  variables: z.record(z.unknown()).optional(),
  eventType: z.string().max(50).optional(),
  category: emailCategorySchema.optional(),
  priority: emailPrioritySchema.default('NORMAL'),
  scheduleAt: z.coerce.date().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string().max(255),
        contentType: z.string().max(100),
        storageKey: z.string().max(500),
        sizeBytes: z.number().int().positive().max(10_485_760),
        checksum: z.string().max(64).optional(),
      }),
    )
    .max(5)
    .optional(),
});

export const listEmailLogsQuerySchema = paginationSchema.extend({
  status: emailDeliveryStatusSchema.optional(),
  recipientUserId: z.string().uuid().optional(),
  templateCode: z.string().max(80).optional(),
  category: emailCategorySchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'sentAt']).default('createdAt'),
});

export const listEmailTemplatesQuerySchema = paginationSchema.extend({
  category: emailCategorySchema.optional(),
  eventType: z.string().max(50).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  locale: z.string().max(10).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['code', 'name', 'createdAt']).default('code'),
});

export const createEmailTemplateSchema = z.object({
  code: z.string().min(2).max(80).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  category: emailCategorySchema.default('TRANSACTIONAL'),
  eventType: z.string().max(50).optional(),
  subject: z.string().min(1).max(500),
  htmlBody: z.string().min(1).max(100_000),
  textBody: z.string().max(50_000).optional(),
  variables: z.array(z.string()).default([]),
  locale: z.string().max(10).default('en'),
  metadata: z.record(z.unknown()).optional(),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createEmailTemplateVersionSchema = z.object({
  subject: z.string().min(1).max(500),
  htmlBody: z.string().min(1).max(100_000),
  textBody: z.string().max(50_000).optional(),
  variables: z.array(z.string()).optional(),
});

export const previewEmailTemplateSchema = z.object({
  templateCode: z.string().max(80).optional(),
  subject: z.string().max(500).optional(),
  htmlBody: z.string().max(100_000).optional(),
  variables: z.record(z.unknown()).default({}),
});

export const listEmailProvidersQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
});

export const createEmailProviderSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(100),
  providerType: emailProviderTypeSchema,
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  config: z.record(z.unknown()).optional(),
  rateLimit: z.coerce.number().int().positive().optional(),
});

export const updateEmailProviderSchema = createEmailProviderSchema.partial();

export const upsertEmailPreferenceSchema = z.object({
  userId: z.string().uuid(),
  category: emailCategorySchema.optional(),
  eventType: z.string().max(50).optional(),
  enabled: z.boolean(),
  marketingOptIn: z.boolean().optional(),
});

export const listEmailPreferencesQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  category: emailCategorySchema.optional(),
});

export const emailAnalyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  templateId: z.string().uuid().optional(),
  category: emailCategorySchema.optional(),
});

export const listEmailQueueQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  queueType: z.enum(['NOTIFICATION', 'RETRY', 'FAILED', 'PRIORITY', 'SCHEDULED']).optional(),
  priority: emailPrioritySchema.optional(),
});

export type SendEnterpriseEmailInput = z.infer<typeof sendEnterpriseEmailSchema>;
export type ListEmailLogsQuery = z.infer<typeof listEmailLogsQuerySchema>;
export type ListEmailTemplatesQuery = z.infer<typeof listEmailTemplatesQuerySchema>;
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
export type CreateEmailTemplateVersionInput = z.infer<typeof createEmailTemplateVersionSchema>;
export type PreviewEmailTemplateInput = z.infer<typeof previewEmailTemplateSchema>;
export type ListEmailProvidersQuery = z.infer<typeof listEmailProvidersQuerySchema>;
export type CreateEmailProviderInput = z.infer<typeof createEmailProviderSchema>;
export type UpdateEmailProviderInput = z.infer<typeof updateEmailProviderSchema>;
export type UpsertEmailPreferenceInput = z.infer<typeof upsertEmailPreferenceSchema>;
export type ListEmailPreferencesQuery = z.infer<typeof listEmailPreferencesQuerySchema>;
export type EmailAnalyticsQuery = z.infer<typeof emailAnalyticsQuerySchema>;
export type ListEmailQueueQuery = z.infer<typeof listEmailQueueQuerySchema>;
