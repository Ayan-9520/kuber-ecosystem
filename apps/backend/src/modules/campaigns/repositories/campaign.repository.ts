import { prisma } from '../../../config/database.js';

export const campaignRepository = {
  // Prisma queries for campaigns module
  getClient: () => prisma,
};
