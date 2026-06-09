export const settingService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'settings', status: 'ok' };
  },
};
