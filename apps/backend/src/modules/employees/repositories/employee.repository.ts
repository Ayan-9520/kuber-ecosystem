import { prisma } from '../../../config/database.js';

export const employeeRepository = {
  // Prisma queries for employees module
  getClient: () => prisma,
};
