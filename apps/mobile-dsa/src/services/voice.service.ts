import type { AiLanguage } from './ai-advisor.service';

import { apiGet, apiPost } from '@/lib/api';


export interface VoiceSession {
  id: string;
  conversationId: string;
  language: AiLanguage;
  status: 'active' | 'ended';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  audioChunkCount: number;
}

export interface VoiceMessageResponse {
  sessionId: string;
  conversationId: string;
  reply: string;
  intent: string;
  language: AiLanguage;
  speak: boolean;
  provider: string;
}

export const voiceService = {
  health: () =>
    apiGet<{ module: string; status: string; sttEnabled: boolean }>('/ai/voice/health'),

  createSession: (body?: { language?: AiLanguage; leadId?: string; applicationId?: string }) =>
    apiPost<VoiceSession>('/ai/voice/sessions', body ?? {}),

  endSession: (sessionId: string) => apiPost<VoiceSession>(`/ai/voice/sessions/${sessionId}/end`),

  sendMessage: (sessionId: string, body: { text: string; language?: AiLanguage }) =>
    apiPost<VoiceMessageResponse>(`/ai/voice/sessions/${sessionId}/message`, body),
};
