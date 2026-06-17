import { render } from '@testing-library/react';

import { AiAdvisorScreen } from '@/features/ai-advisor/screens/AiAdvisorScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { ReferralsScreen } from '@/features/referrals/screens/ReferralsScreen';
import { SupportScreen } from '@/features/support/screens/SupportScreen';
import { VoiceAiScreen } from '@/features/voice-ai/screens/VoiceAiScreen';

jest.mock('@/lib/ai-chat', () => ({
  sendAdvisorChat: jest.fn(async () => ({ conversationId: '1', reply: 'ok' })),
}));

jest.mock('@/services', () => ({
  voiceService: {
    createSession: jest.fn(async () => ({ sessionId: 'vs-1' })),
    transcribe: jest.fn(),
    synthesize: jest.fn(),
  },
  notificationsService: {
    list: jest.fn(),
    communicationLogs: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

describe('DSA support, notifications & AI', () => {
  it('Support renders', () => {
    expect(() => render(<SupportScreen />)).not.toThrow();
  });

  it('Notifications renders', () => {
    expect(() => render(<NotificationsScreen />)).not.toThrow();
  });

  it('Referrals renders', () => {
    expect(() => render(<ReferralsScreen />)).not.toThrow();
  });

  it('AiAdvisor renders', () => {
    expect(() => render(<AiAdvisorScreen />)).not.toThrow();
  });

  it('VoiceAi renders', () => {
    expect(() => render(<VoiceAiScreen />)).not.toThrow();
  });
});
