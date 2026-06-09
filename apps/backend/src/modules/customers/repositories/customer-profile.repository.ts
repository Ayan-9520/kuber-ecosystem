import { prisma } from '../../../config/database.js';
import type { UpsertCustomerProfileInput } from '../types/customers.types.js';

export const customerProfileRepository = {
  findByCustomerId: (customerId: string) =>
    prisma.customerProfile.findUnique({ where: { customerId } }),

  upsert: (input: UpsertCustomerProfileInput) =>
    prisma.customerProfile.upsert({
      where: { customerId: input.customerId },
      create: {
        customerId: input.customerId,
        photoS3Key: input.photoS3Key,
        alternatePhone: input.alternatePhone,
        alternateEmail: input.alternateEmail,
        preferredLanguage: input.preferredLanguage as never,
        preferredContactChannel: input.preferredContactChannel as never,
        nationality: input.nationality,
        residentialStatus: input.residentialStatus as never,
        createdById: input.actorId,
        updatedById: input.actorId,
      },
      update: {
        photoS3Key: input.photoS3Key,
        alternatePhone: input.alternatePhone,
        alternateEmail: input.alternateEmail,
        preferredLanguage: input.preferredLanguage as never,
        preferredContactChannel: input.preferredContactChannel as never,
        nationality: input.nationality,
        residentialStatus: input.residentialStatus as never,
        updatedById: input.actorId,
      },
    }),
};
