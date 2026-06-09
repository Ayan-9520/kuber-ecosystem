import { prisma } from '../../../config/database.js';

export const customerPreferencesRepository = {
  findByCustomerId: (customerId: string) =>
    prisma.customerPreferences.findUnique({ where: { customerId } }),

  upsert: (customerId: string, data: Record<string, unknown>, actorId: string) =>
    prisma.customerPreferences.upsert({
      where: { customerId },
      create: {
        customerId,
        ...data,
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        ...data,
        updatedById: actorId,
      },
    }),
};
