import { prisma } from '../../../config/database.js';

export const userRepository = {
  findById: (id: string) =>
    prisma.user.findFirst({
      where: { id, deletedAt: null },
    }),

  findByEmail: (email: string) =>
    prisma.user.findFirst({
      where: { email, deletedAt: null },
    }),

  findByPhone: (phone: string) =>
    prisma.user.findFirst({
      where: { phone, deletedAt: null },
    }),

  updateLastLogin: (userId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }),

  updatePhone: (userId: string, phone: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { phone, phoneVerified: true },
    }),

  setStatus: (userId: string, status: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { status },
    }),

  findEmployeeByUserId: (userId: string) =>
    prisma.employee.findUnique({
      where: { userId },
      include: { branch: { include: { region: true } } },
    }),

  findCustomerByUserId: (userId: string) =>
    prisma.customer.findFirst({
      where: { userId, deletedAt: null },
    }),

  findPartnerByUserId: (userId: string) =>
    prisma.partner.findFirst({
      where: { userId, deletedAt: null },
    }),
};
