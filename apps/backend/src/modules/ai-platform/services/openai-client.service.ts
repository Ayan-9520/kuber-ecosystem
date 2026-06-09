import OpenAI from 'openai';

import { env } from '../../../config/env.js';

let client: OpenAI | null = null;

export const openAiClientService = {
  getClient(): OpenAI | null {
    if (!env.OPENAI_API_KEY) return null;
    if (!client) {
      client = new OpenAI({ apiKey: env.OPENAI_API_KEY, maxRetries: 2, timeout: 60_000 });
    }
    return client;
  },

  isConfigured(): boolean {
    return !!env.OPENAI_API_KEY && this.getClient() !== null;
  },

  reset(): void {
    client = null;
  },
};
