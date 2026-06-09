import type { AiLanguage } from './ai-advisor.service';

import { apiGet, apiPost } from '@/lib/api';


export interface VoiceSession {
  id: string;
  conversationId: string;
  language: AiLanguage;
  customerId?: string;
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

export interface VoiceAudioResponse {
  sessionId: string;
  status: 'received';
  transcript: string | null;
  sttEnabled: boolean;
  message?: string;
}

export const voiceService = {
  health: () =>
    apiGet<{ module: string; status: string; sttEnabled: boolean }>('/ai/voice/health'),

  createSession: (body?: {
    language?: AiLanguage;
    conversationId?: string;
    customerId?: string;
    leadId?: string;
    applicationId?: string;
  }) => apiPost<VoiceSession>('/ai/voice/sessions', body ?? {}),

  getSession: (sessionId: string) => apiGet<VoiceSession>(`/ai/voice/sessions/${sessionId}`),

  endSession: (sessionId: string) => apiPost<VoiceSession>(`/ai/voice/sessions/${sessionId}/end`),

  sendMessage: (
    sessionId: string,
    body: { text: string; language?: AiLanguage; customerId?: string },
  ) => apiPost<VoiceMessageResponse>(`/ai/voice/sessions/${sessionId}/message`, body),

  sendAudio: (
    sessionId: string,
    body: {
      mimeType?: string;
      durationMs?: number;
      byteLength?: number;
      transcript?: string;
    },
  ) => apiPost<VoiceAudioResponse>(`/ai/voice/sessions/${sessionId}/audio`, body),
};
