export const auditService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'audit', status: 'ok' };
  },
};
