export const branchService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'branches', status: 'ok' };
  },
};
