export const emiService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'emi', status: 'ok' };
  },
};
