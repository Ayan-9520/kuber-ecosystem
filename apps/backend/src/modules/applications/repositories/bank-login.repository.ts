import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const include = {
  application: { select: { id: true, applicationNumber: true, status: true } },
  lender: { select: { id: true, code: true, name: true } },
  submittedBy: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
} satisfies Prisma.BankLoginInclude;

export const bankLoginRepository = {
  findById: (id: string) => prisma.bankLogin.findUnique({ where: { id }, include }),

  list: (
    where: Prisma.BankLoginWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.BankLoginOrderByWithRelationInput,
  ) => prisma.bankLogin.findMany({ where, skip, take, orderBy, include }),

  count: (where: Prisma.BankLoginWhereInput) => prisma.bankLogin.count({ where }),

  create: (data: Prisma.BankLoginUncheckedCreateInput) => prisma.bankLogin.create({ data, include }),

  update: (id: string, data: Prisma.BankLoginUncheckedUpdateInput) =>
    prisma.bankLogin.update({ where: { id }, data, include }),
};
