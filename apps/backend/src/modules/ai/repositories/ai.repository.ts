import { prisma } from '../../../config/database.js';

export const aiRepository = {
  // Prisma queries for ai module
  getClient: () => prisma,
};
