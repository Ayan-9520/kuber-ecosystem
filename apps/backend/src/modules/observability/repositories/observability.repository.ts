import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const observabilityRepository = {
  log: {
    findMany: (args: Prisma.ObservabilityLogFindManyArgs) => prisma.observabilityLog.findMany(args),
    count: (where: Prisma.ObservabilityLogWhereInput) => prisma.observabilityLog.count({ where }),
    create: (data: Prisma.ObservabilityLogCreateInput) => prisma.observabilityLog.create({ data }),
    createMany: (data: Prisma.ObservabilityLogCreateManyInput[]) => prisma.observabilityLog.createMany({ data }),
  },

  trace: {
    findMany: (args: Prisma.ObservabilityTraceFindManyArgs) => prisma.observabilityTrace.findMany(args),
    count: (where: Prisma.ObservabilityTraceWhereInput) => prisma.observabilityTrace.count({ where }),
    findByTraceId: (traceId: string) => prisma.observabilityTrace.findUnique({ where: { traceId } }),
    upsert: (traceId: string, create: Prisma.ObservabilityTraceCreateInput, update: Prisma.ObservabilityTraceUpdateInput) =>
      prisma.observabilityTrace.upsert({ where: { traceId }, create, update }),
  },

  error: {
    findMany: (args: Prisma.ObservabilityErrorFindManyArgs) => prisma.observabilityError.findMany(args),
    count: (where: Prisma.ObservabilityErrorWhereInput) => prisma.observabilityError.count({ where }),
    findById: (id: string) => prisma.observabilityError.findUnique({ where: { id } }),
    create: (data: Prisma.ObservabilityErrorCreateInput) => prisma.observabilityError.create({ data }),
  },

  event: {
    findMany: (args: Prisma.ObservabilityEventFindManyArgs) => prisma.observabilityEvent.findMany(args),
    count: (where: Prisma.ObservabilityEventWhereInput) => prisma.observabilityEvent.count({ where }),
    create: (data: Prisma.ObservabilityEventCreateInput) => prisma.observabilityEvent.create({ data }),
  },

  retention: {
    findMany: () => prisma.observabilityRetentionPolicy.findMany({ where: { isActive: true } }),
    upsert: (code: string, data: Prisma.ObservabilityRetentionPolicyCreateInput) =>
      prisma.observabilityRetentionPolicy.upsert({ where: { code }, create: data, update: data }),
  },
};
