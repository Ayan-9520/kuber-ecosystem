import { apiGet, apiPost } from '@/lib/api';

export type AiLanguage = 'en' | 'hi' | 'hinglish';

export interface AiChatResponse {
  conversationId: string;
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    language?: AiLanguage;
    createdAt?: string;
  };
  intent: string;
  contextUsed: boolean;
  model: string;
  provider: 'openai' | 'rules-engine';
}

export interface AiConversationSummary {
  id: string;
  audience?: string;
  language?: string;
  customerId?: string;
  createdAt: string;
}

export const aiAdvisorService = {
  health: () => apiGet<{ module: string; status: string }>('/ai/health'),

  chat: (body: {
    message: string;
    conversationId?: string;
    language?: AiLanguage;
    customerId?: string;
    leadId?: string;
    applicationId?: string;
  }) => apiPost<AiChatResponse>('/ai/chat', body),

  conversations: (limit = 20) =>
    apiGet<AiConversationSummary[]>('/ai/conversations', { limit }),
};
