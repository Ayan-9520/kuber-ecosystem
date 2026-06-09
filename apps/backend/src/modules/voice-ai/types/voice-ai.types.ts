import type { AiLanguage } from '../../ai-advisor/constants/ai-advisor.constants.js';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface VoiceSessionMeta {
  userId: string;
  conversationId: string;
  language: AiLanguage;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  status: 'active' | 'ended';
}

export interface VoiceSessionRecord extends VoiceSessionMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  audioChunkCount: number;
}

export interface VoiceMessageResult {
  sessionId: string;
  conversationId: string;
  reply: string;
  intent: string;
  language: AiLanguage;
  speak: boolean;
  provider: string;
}

export interface VoiceAudioResult {
  sessionId: string;
  status: 'received';
  transcript: string | null;
  sttEnabled: boolean;
  ttsEnabled?: boolean;
  message?: string;
  audioBase64?: string;
}
