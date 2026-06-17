export default class OpenAI {
  chat = {
    completions: {
      create: async () => ({
        choices: [{ message: { content: 'Integration mock AI response' } }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    },
  };

  embeddings = {
    create: async () => ({
      data: [{ embedding: [0.1, 0.2, 0.3, 0.4] }],
    }),
  };

  audio = {
    transcriptions: {
      create: async () => ({ text: 'integration transcription' }),
    },
    speech: {
      create: async () => Buffer.from('audio'),
    },
  };
}
