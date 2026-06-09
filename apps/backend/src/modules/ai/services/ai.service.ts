export const aiService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'ai', status: 'ok' };
  },
};
