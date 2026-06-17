import { render, screen } from '@testing-library/react';

import { AiAdvisorScreen } from '@/features/ai-advisor/screens/AiAdvisorScreen';
import { VoiceAiScreen } from '@/features/voice-ai/screens/VoiceAiScreen';

jest.mock('@/lib/ai-chat', () => ({
  sendAdvisorChat: jest.fn(async () => ({
    conversationId: 'c1',
    reply: 'Mock AI response',
  })),
}));

jest.mock('@/services', () => ({
  voiceService: {
    transcribe: jest.fn(),
    synthesize: jest.fn(),
    createSession: jest.fn(async () => ({ sessionId: 'vs-1' })),
  },
}));

describe('Customer AI screens', () => {
  it('AiAdvisor — welcome message', () => {
    render(<AiAdvisorScreen />);
    expect(screen.getByText(/Powered by KuberOne AI/i)).toBeTruthy();
  });

  it('VoiceAi — voice interface', () => {
    render(<VoiceAiScreen />);
    expect(screen.getByText(/Voice mode ready/i)).toBeTruthy();
  });
});
