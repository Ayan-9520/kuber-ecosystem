import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const campaignRepository = {
  list(
    where: Prisma.CampaignWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.CampaignOrderByWithRelationInput,
  ) {
    return prisma.campaign.findMany({ where, skip, take, orderBy });
  },

  count(where: Prisma.CampaignWhereInput) {
    return prisma.campaign.count({ where });
  },

  findById(id: string) {
    return prisma.campaign.findUnique({ where: { id } });
  },

  create(data: Prisma.CampaignCreateInput) {
    return prisma.campaign.create({ data });
  },

  update(id: string, data: Prisma.CampaignUpdateInput) {
    return prisma.campaign.update({ where: { id }, data });
  },

  softDelete(id: string, deletedById: string) {
    return prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById, status: 'CANCELLED' },
    });
  },
};
