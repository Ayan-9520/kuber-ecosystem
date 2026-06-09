import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const closureRepository = {
  findByApplicationId: (applicationId: string) =>
    prisma.closure.findUnique({
      where: { applicationId },
      include: {
        application: { select: { id: true, applicationNumber: true } },
        rmAssigned: { select: { id: true, firstName: true, lastName: true } },
      },
    }),

  create: (data: Prisma.ClosureUncheckedCreateInput) => prisma.closure.create({ data }),
};
