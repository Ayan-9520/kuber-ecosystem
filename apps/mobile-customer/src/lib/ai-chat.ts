import { processAiMessage } from './ai-orchestrator';

import { aiAdvisorService, type AiLanguage } from '@/services/ai-advisor.service';
import { voiceService } from '@/services/voice.service';


export interface AdvisorChatResult {
  reply: string;
  conversationId?: string;
  intent?: string;
  provider?: string;
}

export async function sendAdvisorChat(params: {
  message: string;
  customerId?: string;
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
        customerId: params.customerId,
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
      customerId: params.customerId,
    });

    return {
      reply: result.message.content,
      conversationId: result.conversationId,
      intent: result.intent,
      provider: result.provider,
    };
  } catch {
    const reply = await processAiMessage(params.message, { customerId: params.customerId });
    return { reply, provider: 'local-rules' };
  }
}
