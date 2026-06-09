import { openAiClientService } from '../modules/ai-platform/services/openai-client.service.js';

/** @deprecated Use openAiClientService.getClient() from ai-platform module */
export function getOpenAiClient() {
  return openAiClientService.getClient();
}

/** @deprecated Use openAiClientService from ai-platform module */
export const openaiClient = {
  get embeddings() {
    const client = openAiClientService.getClient();
    if (!client) throw new Error('OpenAI client not configured');
    return client.embeddings;
  },
  get chat() {
    const client = openAiClientService.getClient();
    if (!client) throw new Error('OpenAI client not configured');
    return client.chat;
  },
  get audio() {
    const client = openAiClientService.getClient();
    if (!client) throw new Error('OpenAI client not configured');
    return client.audio;
  },
};
