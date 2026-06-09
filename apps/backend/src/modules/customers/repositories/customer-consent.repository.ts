import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const customerConsentRepository = {
  listByCustomer: (customerId: string, consentType?: string) =>
    prisma.customerConsent.findMany({
      where: {
        customerId,
        ...(consentType ? { consentType: consentType as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
    }),

  create: (data: Prisma.CustomerConsentUncheckedCreateInput) =>
    prisma.customerConsent.create({ data }),
};
