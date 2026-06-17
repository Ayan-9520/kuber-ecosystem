import { createMockFn } from './prisma.mock.js';

export function createOpenAiMock() {
  return {
    chat: {
      completions: {
        create: createMockFn(async () => ({
          choices: [{ message: { content: 'Mock AI advisor response for testing.' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        })),
      },
    },
    embeddings: {
      create: createMockFn(async () => ({
        data: [{ embedding: Array.from({ length: 8 }, (_, i) => i * 0.1) }],
      })),
    },
    audio: {
      transcriptions: {
        create: createMockFn(async () => ({ text: 'mock transcription' })),
      },
      speech: {
        create: createMockFn(async () => Buffer.from('mock-audio')),
      },
    },
  };
}

export const openAiMockResponses = {
  advisor: 'Based on your profile, a personal loan of ₹5L at 12% is recommended.',
  leadScore: { score: 78, grade: 'HOT', factors: { income: 25, intent: 30, engagement: 23 } },
  ragAnswer: 'KuberOne supports home loans, personal loans, and business loans.',
  recommendation: { productId: 'product-1', confidence: 0.87 },
};
