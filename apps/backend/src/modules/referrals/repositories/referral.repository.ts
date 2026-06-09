import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { referralInclude } from '../types/referrals.types.js';

export const referralTypeRepository = {
  list(where: Prisma.ReferralTypeWhereInput, skip: number, take: number, orderBy: Prisma.ReferralTypeOrderByWithRelationInput) {
    return prisma.referralType.findMany({ where, skip, take, orderBy });
  },

  count(where: Prisma.ReferralTypeWhereInput) {
    return prisma.referralType.count({ where });
  },

  findById(id: string) {
    return prisma.referralType.findUnique({ where: { id } });
  },

  findByCode(code: string) {
    return prisma.referralType.findUnique({ where: { code: code as never } });
  },

  create(data: Prisma.ReferralTypeCreateInput) {
    return prisma.referralType.create({ data });
  },

  update(id: string, data: Prisma.ReferralTypeUpdateInput) {
    return prisma.referralType.update({ where: { id }, data });
  },
};

export const referralRepository = {
  list(where: Prisma.ReferralWhereInput, skip: number, take: number, orderBy: Prisma.ReferralOrderByWithRelationInput) {
    return prisma.referral.findMany({ where, skip, take, orderBy, include: referralInclude });
  },

  count(where: Prisma.ReferralWhereInput) {
    return prisma.referral.count({ where });
  },

  findById(id: string) {
    return prisma.referral.findUnique({ where: { id }, include: referralInclude });
  },

  findByCode(referralCode: string) {
    return prisma.referral.findFirst({
      where: { referralCode, deletedAt: null },
      include: referralInclude,
    });
  },

  getLastReferralNumber() {
    return prisma.referral.findFirst({ orderBy: { referralNumber: 'desc' }, select: { referralNumber: true } });
  },

  create(data: Prisma.ReferralCreateInput) {
    return prisma.referral.create({ data, include: referralInclude });
  },

  update(id: string, data: Prisma.ReferralUpdateInput) {
    return prisma.referral.update({ where: { id }, data, include: referralInclude });
  },

  softDelete(id: string, deletedById: string) {
    return prisma.referral.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
      include: referralInclude,
    });
  },
};
