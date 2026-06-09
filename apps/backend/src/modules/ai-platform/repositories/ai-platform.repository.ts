import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const aiPlatformRepository = {
  findProviderByCode(code: string) {
    return prisma.aiProvider.findUnique({ where: { code }, include: { models: { where: { isActive: true } } } });
  },

  listModels(capability?: string) {
    return prisma.aiModel.findMany({
      where: {
        isActive: true,
        ...(capability ? { capability: capability as never } : {}),
      },
      include: { provider: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  },

  findModelRoute(module: string, capability: string) {
    return prisma.aiModelRoute.findUnique({
      where: { module_capability: { module: module as never, capability: capability as never } },
      include: { primaryModel: { include: { provider: true } }, fallbackModel: { include: { provider: true } } },
    });
  },

  findPromptTemplate(code: string) {
    return prisma.aiPromptTemplate.findUnique({
      where: { code },
      include: { versions: { where: { isActive: true }, orderBy: { version: 'desc' }, take: 1 } },
    });
  },

  listPromptTemplates(module?: string) {
    return prisma.aiPromptTemplate.findMany({
      where: {
        isActive: true,
        ...(module ? { module: module as never } : {}),
      },
      include: { versions: { where: { isActive: true }, orderBy: { version: 'desc' }, take: 1 } },
      orderBy: { name: 'asc' },
    });
  },

  createRequest(data: Prisma.AiRequestCreateInput) {
    return prisma.aiRequest.create({ data });
  },

  updateRequest(id: string, data: Prisma.AiRequestUpdateInput) {
    return prisma.aiRequest.update({ where: { id }, data });
  },

  createResponse(data: Prisma.AiResponseCreateInput) {
    return prisma.aiResponse.create({ data });
  },

  createUsageLog(data: Prisma.AiUsageLogCreateInput) {
    return prisma.aiUsageLog.create({ data });
  },

  createCostLog(data: Prisma.AiCostLogCreateInput) {
    return prisma.aiCostLog.create({ data });
  },

  createModerationLog(data: Prisma.AiModerationLogCreateInput) {
    return prisma.aiModerationLog.create({ data });
  },

  countRequests(where?: Prisma.AiRequestWhereInput) {
    return prisma.aiRequest.count({ where });
  },

  countFailedRequests(where?: Prisma.AiRequestWhereInput) {
    return prisma.aiRequest.count({ where: { ...where, status: 'FAILED' } });
  },

  aggregateUsage(where?: Prisma.AiUsageLogWhereInput) {
    return prisma.aiUsageLog.aggregate({
      where,
      _sum: { totalTokens: true, inputTokens: true, outputTokens: true },
      _avg: { latencyMs: true },
      _count: { id: true },
    });
  },

  aggregateCosts(where?: Prisma.AiCostLogWhereInput) {
    return prisma.aiCostLog.aggregate({
      where,
      _sum: { totalCost: true, inputCost: true, outputCost: true },
      _count: { id: true },
    });
  },

  usageByModule(where?: Prisma.AiUsageLogWhereInput) {
    return prisma.aiUsageLog.groupBy({
      by: ['module'],
      where,
      _count: { id: true },
      _sum: { totalTokens: true },
    });
  },

  usageByRequestType(where?: Prisma.AiUsageLogWhereInput) {
    return prisma.aiUsageLog.groupBy({
      by: ['requestType'],
      where,
      _count: { id: true },
    });
  },

  costsByModule(where?: Prisma.AiCostLogWhereInput) {
    return prisma.aiCostLog.groupBy({
      by: ['module'],
      where,
      _sum: { totalCost: true },
    });
  },

  costsByModel(where?: Prisma.AiCostLogWhereInput) {
    return prisma.aiCostLog.groupBy({
      by: ['modelCode'],
      where,
      _sum: { totalCost: true },
      _count: { id: true },
    });
  },

  topModelsByUsage(take = 10) {
    return prisma.aiUsageLog.groupBy({
      by: ['modelCode'],
      _count: { id: true },
      _sum: { totalTokens: true },
      orderBy: { _count: { id: 'desc' } },
      take,
    });
  },

  recentErrors(take = 20) {
    return prisma.aiRequest.findMany({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        module: true,
        requestType: true,
        modelCode: true,
        errorCode: true,
        errorMessage: true,
        createdAt: true,
      },
    });
  },
};
