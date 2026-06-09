import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const defaultInclude = {
  product: { select: { id: true, code: true, name: true } },
  variant: { select: { id: true, variantCode: true, name: true } },
  customer: { select: { id: true, customerCode: true, fullName: true } },
  computedBy: { select: { id: true, email: true } },
} satisfies Prisma.FinanceCalculationInclude;

export const financeCalculationRepository = {
  create(data: Prisma.FinanceCalculationCreateInput) {
    return prisma.financeCalculation.create({ data, include: defaultInclude });
  },

  findByCacheKey(cacheKey: string) {
    return prisma.financeCalculation.findUnique({ where: { cacheKey }, include: defaultInclude });
  },

  findById(id: string) {
    return prisma.financeCalculation.findUnique({ where: { id }, include: defaultInclude });
  },

  list(where: Prisma.FinanceCalculationWhereInput, skip: number, take: number, orderBy: Prisma.FinanceCalculationOrderByWithRelationInput) {
    return prisma.financeCalculation.findMany({ where, skip, take, orderBy, include: defaultInclude });
  },

  count(where: Prisma.FinanceCalculationWhereInput) {
    return prisma.financeCalculation.count({ where });
  },
};

export const emiCalculationRepository = {
  create(data: Prisma.FinanceCalculationCreateInput) {
    return financeCalculationRepository.create(data);
  },
};

export const eligibilityCalculationRepository = {
  create(data: Prisma.FinanceCalculationCreateInput) {
    return financeCalculationRepository.create(data);
  },
};

export const savingsCalculationRepository = {
  create(data: Prisma.FinanceCalculationCreateInput) {
    return financeCalculationRepository.create(data);
  },
};

export const loanComparisonRepository = {
  create(data: Prisma.FinanceCalculationCreateInput) {
    return financeCalculationRepository.create(data);
  },
};

export const approvalProbabilityRepository = {
  create(data: Prisma.FinanceCalculationCreateInput) {
    return financeCalculationRepository.create(data);
  },
};
