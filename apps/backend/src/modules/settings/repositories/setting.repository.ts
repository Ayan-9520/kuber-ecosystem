import { prisma } from '../../../config/database.js';

export const settingRepository = {
  // Prisma queries for settings module
  getClient: () => prisma,
};
