import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const ticketInclude = {
  category: true,
  customer: { select: { id: true, fullName: true, customerCode: true, userId: true } },
  partner: { select: { id: true, partnerCode: true, businessName: true } },
  application: { select: { id: true, applicationNumber: true } },
  lead: { select: { id: true, leadNumber: true } },
  branch: { select: { id: true, code: true, name: true } },
  region: { select: { id: true, code: true, name: true } },
  assignedTo: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  assignedUser: { select: { id: true, email: true, phone: true } },
  createdBy: { select: { id: true, email: true, phone: true } },
} satisfies Prisma.TicketInclude;

export const ticketRepository = {
  findById: (id: string) =>
    prisma.ticket.findFirst({ where: { id, deletedAt: null }, include: ticketInclude }),

  getLastTicketNumber: () =>
    prisma.ticket.findFirst({ orderBy: { createdAt: 'desc' }, select: { ticketNumber: true } }),

  list: (
    where: Prisma.TicketWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.TicketOrderByWithRelationInput,
  ) => prisma.ticket.findMany({ where, skip, take, orderBy, include: ticketInclude }),

  count: (where: Prisma.TicketWhereInput) => prisma.ticket.count({ where }),

  create: (data: Prisma.TicketUncheckedCreateInput) =>
    prisma.ticket.create({ data, include: ticketInclude }),

  update: (id: string, data: Prisma.TicketUncheckedUpdateInput) =>
    prisma.ticket.update({ where: { id }, data, include: ticketInclude }),

  softDelete: (id: string, deletedById: string) =>
    prisma.ticket.update({ where: { id }, data: { deletedAt: new Date(), deletedById } }),

  groupByStatus: (where: Prisma.TicketWhereInput) =>
    prisma.ticket.groupBy({ by: ['status'], where, _count: { id: true } }),

  groupByPriority: (where: Prisma.TicketWhereInput) =>
    prisma.ticket.groupBy({ by: ['priority'], where, _count: { id: true } }),

  groupByCategory: (where: Prisma.TicketWhereInput) =>
    prisma.ticket.groupBy({ by: ['categoryId'], where, _count: { id: true } }),

  groupByBranch: (where: Prisma.TicketWhereInput) =>
    prisma.ticket.groupBy({ by: ['branchId'], where, _count: { id: true } }),

  groupByAssignee: (where: Prisma.TicketWhereInput) =>
    prisma.ticket.groupBy({ by: ['assignedUserId'], where, _count: { id: true } }),
};

export const ticketCategoryRepository = {
  findById: (id: string) => prisma.ticketCategory.findUnique({ where: { id } }),
  findByCode: (code: string) => prisma.ticketCategory.findUnique({ where: { code } }),
  list: (
    where: Prisma.TicketCategoryWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.TicketCategoryOrderByWithRelationInput,
  ) => prisma.ticketCategory.findMany({ where, skip, take, orderBy }),
  count: (where: Prisma.TicketCategoryWhereInput) => prisma.ticketCategory.count({ where }),
  create: (data: Prisma.TicketCategoryUncheckedCreateInput) => prisma.ticketCategory.create({ data }),
  update: (id: string, data: Prisma.TicketCategoryUncheckedUpdateInput) =>
    prisma.ticketCategory.update({ where: { id }, data }),
};

export const ticketMessageRepository = {
  findById: (id: string) =>
    prisma.ticketMessage.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true, phone: true } }, attachments: true },
    }),
  list: (
    where: Prisma.TicketMessageWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.TicketMessageOrderByWithRelationInput,
  ) =>
    prisma.ticketMessage.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { author: { select: { id: true, email: true, phone: true } }, attachments: true },
    }),
  count: (where: Prisma.TicketMessageWhereInput) => prisma.ticketMessage.count({ where }),
  create: (data: Prisma.TicketMessageUncheckedCreateInput) =>
    prisma.ticketMessage.create({
      data,
      include: { author: { select: { id: true, email: true, phone: true } }, attachments: true },
    }),
};

export const ticketAssignmentRepository = {
  list: (
    where: Prisma.TicketAssignmentWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.TicketAssignmentOrderByWithRelationInput,
  ) =>
    prisma.ticketAssignment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        assignedTo: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
        assignedUser: { select: { id: true, email: true, phone: true } },
        assignedBy: { select: { id: true, email: true, phone: true } },
      },
    }),
  count: (where: Prisma.TicketAssignmentWhereInput) => prisma.ticketAssignment.count({ where }),
  create: (data: Prisma.TicketAssignmentUncheckedCreateInput) => prisma.ticketAssignment.create({ data }),
};

export const ticketEscalationRepository = {
  list: (
    where: Prisma.TicketEscalationWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.TicketEscalationOrderByWithRelationInput,
  ) =>
    prisma.ticketEscalation.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { escalatedBy: { select: { id: true, email: true, phone: true } } },
    }),
  count: (where: Prisma.TicketEscalationWhereInput) => prisma.ticketEscalation.count({ where }),
  create: (data: Prisma.TicketEscalationUncheckedCreateInput) => prisma.ticketEscalation.create({ data }),
};

export const ticketResolutionRepository = {
  list: (
    where: Prisma.TicketResolutionWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.TicketResolutionOrderByWithRelationInput,
  ) =>
    prisma.ticketResolution.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { resolvedBy: { select: { id: true, email: true, phone: true } } },
    }),
  count: (where: Prisma.TicketResolutionWhereInput) => prisma.ticketResolution.count({ where }),
  create: (data: Prisma.TicketResolutionUncheckedCreateInput) => prisma.ticketResolution.create({ data }),
};

export const ticketAttachmentRepository = {
  findById: (id: string) => prisma.ticketAttachment.findUnique({ where: { id } }),
  listByTicket: (ticketId: string) =>
    prisma.ticketAttachment.findMany({ where: { ticketId }, orderBy: { createdAt: 'desc' } }),
  create: (data: Prisma.TicketAttachmentUncheckedCreateInput) => prisma.ticketAttachment.create({ data }),
};
