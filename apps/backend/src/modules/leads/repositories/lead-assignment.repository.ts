import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const assignmentInclude = {
  lead: { select: { id: true, leadNumber: true, prospectName: true, status: true, grade: true } },
  assignedTo: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  assignedBy: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  branch: { select: { id: true, code: true, name: true } },
} satisfies Prisma.LeadAssignmentInclude;

export const leadAssignmentRepository = {
  findById: (id: string) =>
    prisma.leadAssignment.findUnique({ where: { id }, include: assignmentInclude }),

  findCurrentByLeadId: (leadId: string) =>
    prisma.leadAssignment.findFirst({
      where: { leadId, isCurrent: true },
      include: assignmentInclude,
    }),

  countActiveByAssignee: (assignedToId: string) =>
    prisma.leadAssignment.count({
      where: {
        assignedToId,
        isCurrent: true,
        lead: { deletedAt: null, status: { notIn: ['LOST', 'REJECTED', 'DISBURSED'] } },
      },
    }),

  listAssigneesByBranch: (branchId: string) =>
    prisma.employee.findMany({
      where: { branchId, isActive: true, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    }),

  list: (
    where: Prisma.LeadAssignmentWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadAssignmentOrderByWithRelationInput,
  ) => prisma.leadAssignment.findMany({ where, skip, take, orderBy, include: assignmentInclude }),

  count: (where: Prisma.LeadAssignmentWhereInput) => prisma.leadAssignment.count({ where }),

  create: (data: Prisma.LeadAssignmentUncheckedCreateInput) =>
    prisma.leadAssignment.create({ data, include: assignmentInclude }),

  clearCurrent: (leadId: string) =>
    prisma.leadAssignment.updateMany({
      where: { leadId, isCurrent: true },
      data: { isCurrent: false, unassignedAt: new Date() },
    }),
};
