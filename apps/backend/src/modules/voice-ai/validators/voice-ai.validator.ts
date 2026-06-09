import { z } from 'zod';

import { aiLanguageSchema } from '../../ai-advisor/validators/ai-advisor.validator.js';

export const createVoiceSessionSchema = z.object({
  language: aiLanguageSchema.default('en'),
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
});

export const voiceSessionIdSchema = z.object({
  sessionId: z.string().uuid(),
});

export const voiceMessageSchema = z.object({
  text: z.string().min(1).max(4000),
  language: aiLanguageSchema.optional(),
  customerId: z.string().uuid().optional(),
});

export const voiceAudioSchema = z.object({
  mimeType: z.string().max(64).optional(),
  durationMs: z.coerce.number().int().min(0).max(600_000).optional(),
  byteLength: z.coerce.number().int().min(0).optional(),
  transcript: z.string().max(4000).optional(),
  audioBase64: z.string().max(10_000_000).optional(),
});

export type CreateVoiceSessionInput = z.infer<typeof createVoiceSessionSchema>;
export type VoiceMessageInput = z.infer<typeof voiceMessageSchema>;
export type VoiceAudioInput = z.infer<typeof voiceAudioSchema>;
