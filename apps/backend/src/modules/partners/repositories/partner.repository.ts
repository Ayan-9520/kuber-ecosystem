import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const partnerInclude = { partnerType: true } satisfies Prisma.PartnerInclude;

export const partnerRepository = {
  list: (where: Prisma.PartnerWhereInput, skip: number, take: number, orderBy: Prisma.PartnerOrderByWithRelationInput) =>
    prisma.partner.findMany({
      where,
      skip,
      take,
      orderBy,
      include: partnerInclude,
    }),

  count: (where: Prisma.PartnerWhereInput) => prisma.partner.count({ where }),

  findById: (id: string) =>
    prisma.partner.findFirst({
      where: { id, deletedAt: null },
      include: partnerInclude,
    }),

  findByPartnerCode: (partnerCode: string) =>
    prisma.partner.findFirst({
      where: { partnerCode, deletedAt: null },
    }),

  findPartnerTypeByCode: (code: string) =>
    prisma.partnerType.findFirst({
      where: { code, isActive: true },
    }),

  findRoleByCode: (code: string) => prisma.role.findUnique({ where: { code } }),

  findUserByPhone: (phone: string) =>
    prisma.user.findFirst({
      where: { phone, deletedAt: null },
    }),

  create: (data: Prisma.PartnerCreateInput) =>
    prisma.partner.create({
      data,
      include: partnerInclude,
    }),

  update: (id: string, data: Prisma.PartnerUpdateInput) =>
    prisma.partner.update({
      where: { id },
      data,
      include: partnerInclude,
    }),

  softDelete: (id: string) =>
    prisma.partner.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      include: partnerInclude,
    }),

  registerPartner: (input: {
    phone: string;
    email?: string;
    businessName: string;
    contactName: string;
    partnerTypeId: string;
    partnerCode: string;
    roleId: string;
  }) =>
    prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: input.phone,
          email: input.email,
          userType: 'PARTNER',
          status: 'PENDING',
          phoneVerified: false,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: input.roleId,
          isPrimary: true,
        },
      });

      const partner = await tx.partner.create({
        data: {
          userId: user.id,
          partnerTypeId: input.partnerTypeId,
          partnerCode: input.partnerCode,
          businessName: input.businessName,
          contactName: input.contactName,
          phone: input.phone,
          email: input.email,
          kycStatus: 'NOT_STARTED',
          status: 'PENDING',
        },
        include: partnerInclude,
      });

      return partner;
    }),
};
