import { z } from 'zod';

export {
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
} from '@kuberone/shared-validation';

export const uuidParamSchema = z.object({ id: z.string().uuid() });
