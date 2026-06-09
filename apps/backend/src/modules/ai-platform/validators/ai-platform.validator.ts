import { z } from 'zod';

const aiModuleSource = z.enum([
  'AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API',
]);

const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

export const chatSchema = z.object({
  module: aiModuleSource.default('API'),
  messages: z.array(chatMessageSchema).min(1),
  model: z.string().optional(),
  temperature: z.coerce.number().min(0).max(2).optional(),
  maxTokens: z.coerce.number().min(1).max(8000).optional(),
  enableTools: z.coerce.boolean().optional(),
  structured: z.coerce.boolean().optional(),
  context: z.object({
    customerId: z.string().uuid().optional(),
    leadId: z.string().uuid().optional(),
    applicationId: z.string().uuid().optional(),
    productCode: z.string().optional(),
    ragQuery: z.string().optional(),
  }).optional(),
});

export const completionSchema = chatSchema;

export const embeddingSchema = z.object({
  module: aiModuleSource.default('RAG'),
  texts: z.array(z.string().min(1)).min(1).max(100),
  model: z.string().optional(),
});

export const transcribeSchema = z.object({
  module: aiModuleSource.default('VOICE_AI'),
  language: z.string().optional(),
  audioBase64: z.string().max(10_000_000).optional(),
  mimeType: z.string().optional(),
});

export const speechSchema = z.object({
  module: aiModuleSource.default('VOICE_AI'),
  text: z.string().min(1).max(4000),
  voice: z.string().optional(),
  model: z.string().optional(),
});

export const usageQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const modelsQuerySchema = z.object({
  capability: z.string().optional(),
});
