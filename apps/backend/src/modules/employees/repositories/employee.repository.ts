import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { employeeInclude } from '../types/employees.types.js';

export const employeeRepository = {
  list(
    where: Prisma.EmployeeWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.EmployeeOrderByWithRelationInput,
  ) {
    return prisma.employee.findMany({ where, skip, take, orderBy, include: employeeInclude });
  },

  count(where: Prisma.EmployeeWhereInput) {
    return prisma.employee.count({ where });
  },

  findById(id: string) {
    return prisma.employee.findUnique({ where: { id }, include: employeeInclude });
  },

  findByEmployeeCode(employeeCode: string) {
    return prisma.employee.findUnique({ where: { employeeCode }, include: employeeInclude });
  },

  findByUserId(userId: string) {
    return prisma.employee.findUnique({ where: { userId }, include: employeeInclude });
  },

  create(data: Prisma.EmployeeCreateInput) {
    return prisma.employee.create({ data, include: employeeInclude });
  },

  update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({ where: { id }, data, include: employeeInclude });
  },

  softDelete(id: string, deletedById: string) {
    return prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById, isActive: false },
      include: employeeInclude,
    });
  },
};
