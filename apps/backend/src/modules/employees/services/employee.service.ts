export const employeeService = {
  health: async (): Promise<{ module: string; status: string }> => {
    return { module: 'employees', status: 'ok' };
  },
};
