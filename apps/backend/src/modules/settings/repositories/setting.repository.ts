import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const settingRepository = {
  list: (where: Prisma.SystemSettingWhereInput, skip: number, take: number) =>
    prisma.systemSetting.findMany({ where, skip, take, orderBy: { key: 'asc' } }),

  count: (where: Prisma.SystemSettingWhereInput) => prisma.systemSetting.count({ where }),

  findByKey: (key: string) => prisma.systemSetting.findUnique({ where: { key } }),

  update: (key: string, data: Prisma.SystemSettingUpdateInput) =>
    prisma.systemSetting.update({ where: { key }, data }),

  upsert: (key: string, data: { value: Prisma.InputJsonValue; category: string; updatedById?: string }) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: data.value,
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.updatedById ? { updatedById: data.updatedById } : {}),
      },
      create: {
        key,
        value: data.value,
        category: data.category,
        ...(data.updatedById ? { updatedById: data.updatedById } : {}),
      },
    }),
};
