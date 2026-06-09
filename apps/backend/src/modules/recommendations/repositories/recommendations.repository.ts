import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const recommendationsRepository = {
  createRecommendation(data: Prisma.RecommendationCreateInput) {
    return prisma.recommendation.create({ data });
  },

  createHistory(data: Prisma.RecommendationHistoryCreateInput) {
    return prisma.recommendationHistory.create({ data });
  },

  createLenderMatch(data: Prisma.LenderMatchCreateInput) {
    return prisma.lenderMatch.create({ data });
  },

  createProductMatch(data: Prisma.ProductMatchCreateInput) {
    return prisma.productMatch.create({ data });
  },

  createCrossSell(data: Prisma.CrossSellRecommendationCreateInput) {
    return prisma.crossSellRecommendation.create({ data });
  },

  createAction(data: Prisma.ActionRecommendationCreateInput) {
    return prisma.actionRecommendation.create({ data });
  },

  createAudit(data: Prisma.RecommendationAuditCreateInput) {
    return prisma.recommendationAudit.create({ data });
  },

  listRules(where: Prisma.RecommendationRuleWhereInput, skip: number, take: number, orderBy: Prisma.RecommendationRuleOrderByWithRelationInput) {
    return prisma.recommendationRule.findMany({ where, skip, take, orderBy });
  },

  countRules(where: Prisma.RecommendationRuleWhereInput) {
    return prisma.recommendationRule.count({ where });
  },

  findRuleByCode(code: string) {
    return prisma.recommendationRule.findUnique({ where: { code } });
  },

  findRuleById(id: string) {
    return prisma.recommendationRule.findUnique({ where: { id } });
  },

  createRule(data: Prisma.RecommendationRuleCreateInput) {
    return prisma.recommendationRule.create({ data });
  },

  updateRule(id: string, data: Prisma.RecommendationRuleUpdateInput) {
    return prisma.recommendationRule.update({ where: { id }, data });
  },

  findActiveWeights(version?: string) {
    return prisma.recommendationWeight.findMany({
      where: {
        isActive: true,
        ...(version ? { version } : {}),
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }],
      },
    });
  },

  upsertWeight(version: string, factor: string, weight: number, createdById?: string) {
    return prisma.recommendationWeight.upsert({
      where: { version_factor: { version, factor } },
      create: { version, factor, weight, isActive: true, effectiveFrom: new Date(), createdById },
      update: { weight, isActive: true },
    });
  },

  countRecommendations(where: Prisma.RecommendationWhereInput) {
    return prisma.recommendation.count({ where });
  },

  countAccepted(where: Prisma.RecommendationWhereInput) {
    return prisma.recommendation.count({ where: { ...where, accepted: true } });
  },

  groupByType(where: Prisma.RecommendationWhereInput) {
    return prisma.recommendation.groupBy({ by: ['recommendationType'], where, _count: { id: true } });
  },

  latestLenderMatches(entityType: string, entityId: string, limit = 5) {
    return prisma.lenderMatch.findMany({
      where: { entityType: entityType as never, entityId },
      orderBy: { rankPosition: 'asc' },
      take: limit,
    });
  },

  latestProductMatches(entityType: string, entityId: string, limit = 5) {
    return prisma.productMatch.findMany({
      where: { entityType: entityType as never, entityId },
      orderBy: { rankPosition: 'asc' },
      take: limit,
    });
  },

  latestHistory(entityType: string, entityId: string, limit = 1) {
    return prisma.recommendationHistory.findMany({
      where: { entityType: entityType as never, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
