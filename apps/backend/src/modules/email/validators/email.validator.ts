import { z } from 'zod';

export {
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
} from '@kuberone/shared-validation';

export const uuidParamSchema = z.object({ id: z.string().uuid() });
