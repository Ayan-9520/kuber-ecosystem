export const VOICE_SESSION_ENTITY = 'voice_ai_session';
export const VOICE_AUDIT_ENTITY = 'voice_ai';

export const VOICE_ACTIONS = {
  SESSION_STARTED: 'VOICE_SESSION_STARTED',
  SESSION_ENDED: 'VOICE_SESSION_ENDED',
  AUDIO_RECEIVED: 'VOICE_AUDIO_RECEIVED',
  MESSAGE: 'VOICE_MESSAGE',
} as const;

export type VoiceSessionStatus = 'active' | 'ended';
