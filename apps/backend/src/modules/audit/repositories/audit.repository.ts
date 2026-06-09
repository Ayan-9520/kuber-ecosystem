import { prisma } from '../../../config/database.js';

export const auditRepository = {
  // Prisma queries for audit module
  getClient: () => prisma,
};
