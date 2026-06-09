import { prisma } from '../../../config/database.js';

export const eligibilityRepository = {
  // Prisma queries for eligibility module
  getClient: () => prisma,
};
