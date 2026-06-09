import { getApiErrorMessage } from '@/lib/utils';
import { aiAdvisorService, type AiLanguage } from '@/services/ai-advisor.service';
import { voiceService } from '@/services/voice.service';

export interface AdvisorChatResult {
  reply: string;
  conversationId?: string;
  intent?: string;
  provider?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export async function sendAdvisorChat(params: {
  message: string;
  conversationId?: string;
  language?: AiLanguage;
  channel?: 'text' | 'voice';
  voiceSessionId?: string;
}): Promise<AdvisorChatResult> {
  try {
    if (params.channel === 'voice' && params.voiceSessionId) {
      const result = await voiceService.sendMessage(params.voiceSessionId, {
        text: params.message,
        language: params.language ?? 'en',
      });
      return {
        reply: result.reply,
        conversationId: result.conversationId,
        intent: result.intent,
        provider: result.provider,
      };
    }

    const result = await aiAdvisorService.chat({
      message: params.message,
      conversationId: params.conversationId,
      language: params.language ?? 'en',
    });

    return {
      reply: result.message.content,
      conversationId: result.conversationId,
      intent: result.intent,
      provider: result.provider,
    };
  } catch (err) {
    return {
      reply: getApiErrorMessage(err) || 'Kuber AI Advisor is temporarily unavailable. Please try again.',
      provider: 'error',
    };
  }
}
