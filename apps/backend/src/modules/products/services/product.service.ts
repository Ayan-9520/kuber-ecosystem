export const productService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'products', status: 'ok' };
  },
};
