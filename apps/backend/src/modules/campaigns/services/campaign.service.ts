export const campaignService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'campaigns', status: 'ok' };
  },
};
