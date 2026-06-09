import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const followUpInclude = {
  lead: { select: { id: true, leadNumber: true, prospectName: true, status: true } },
  assignedTo: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
} satisfies Prisma.LeadFollowUpInclude;

export const leadFollowUpRepository = {
  findById: (id: string) =>
    prisma.leadFollowUp.findUnique({ where: { id }, include: followUpInclude }),

  list: (
    where: Prisma.LeadFollowUpWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadFollowUpOrderByWithRelationInput,
  ) => prisma.leadFollowUp.findMany({ where, skip, take, orderBy, include: followUpInclude }),

  count: (where: Prisma.LeadFollowUpWhereInput) => prisma.leadFollowUp.count({ where }),

  create: (data: Prisma.LeadFollowUpUncheckedCreateInput) =>
    prisma.leadFollowUp.create({ data, include: followUpInclude }),

  update: (id: string, data: Prisma.LeadFollowUpUncheckedUpdateInput) =>
    prisma.leadFollowUp.update({ where: { id }, data, include: followUpInclude }),

  findOverdue: (before: Date) =>
    prisma.leadFollowUp.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lt: before },
        reminderSent: false,
      },
      include: followUpInclude,
      take: 100,
    }),

  findDueForReminder: (from: Date, to: Date) =>
    prisma.leadFollowUp.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { gte: from, lte: to },
        reminderSent: false,
      },
      include: followUpInclude,
      take: 100,
    }),
};
