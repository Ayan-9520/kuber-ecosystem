import { prisma } from '../../../config/database.js';

export const emiRepository = {
  // Prisma queries for emi module
  getClient: () => prisma,
};
