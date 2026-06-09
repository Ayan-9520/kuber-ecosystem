import { prisma } from '../../../config/database.js';

export const branchRepository = {
  // Prisma queries for branches module
  getClient: () => prisma,
};
