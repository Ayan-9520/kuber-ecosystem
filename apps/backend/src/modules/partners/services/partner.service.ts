export const partnerService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'partners', status: 'ok' };
  },
};
