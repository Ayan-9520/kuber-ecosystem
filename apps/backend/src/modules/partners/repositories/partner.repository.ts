import { prisma } from '../../../config/database.js';

export const partnerRepository = {
  // Prisma queries for partners module
  getClient: () => prisma,
};
