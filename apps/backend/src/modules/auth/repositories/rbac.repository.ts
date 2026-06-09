import { prisma } from '../../../config/database.js';

export const rbacRepository = {
  getUserRolesWithPermissions: (userId: string) =>
    prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    }),
};
