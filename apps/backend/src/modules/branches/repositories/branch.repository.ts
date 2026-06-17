import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { branchInclude } from '../types/branches.types.js';

export const regionRepository = {
  list(
    where: Prisma.RegionWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.RegionOrderByWithRelationInput,
  ) {
    return prisma.region.findMany({ where, skip, take, orderBy });
  },

  count(where: Prisma.RegionWhereInput) {
    return prisma.region.count({ where });
  },

  findById(id: string) {
    return prisma.region.findUnique({ where: { id } });
  },

  findByCode(code: string) {
    return prisma.region.findUnique({ where: { code } });
  },

  create(data: Prisma.RegionCreateInput) {
    return prisma.region.create({ data });
  },

  update(id: string, data: Prisma.RegionUpdateInput) {
    return prisma.region.update({ where: { id }, data });
  },
};

export const branchRepository = {
  list(
    where: Prisma.BranchWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.BranchOrderByWithRelationInput,
  ) {
    return prisma.branch.findMany({ where, skip, take, orderBy, include: branchInclude });
  },

  count(where: Prisma.BranchWhereInput) {
    return prisma.branch.count({ where });
  },

  findById(id: string) {
    return prisma.branch.findUnique({ where: { id }, include: branchInclude });
  },

  findByCode(code: string) {
    return prisma.branch.findUnique({ where: { code }, include: branchInclude });
  },

  create(data: Prisma.BranchCreateInput) {
    return prisma.branch.create({ data, include: branchInclude });
  },

  update(id: string, data: Prisma.BranchUpdateInput) {
    return prisma.branch.update({ where: { id }, data, include: branchInclude });
  },

  softDelete(id: string) {
    return prisma.branch.update({
      where: { id },
      data: { isActive: false },
      include: branchInclude,
    });
  },
};
