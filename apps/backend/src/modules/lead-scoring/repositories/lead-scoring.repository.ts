import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const leadScoringRepository = {
  findActiveWeights(version?: string) {
    return prisma.leadWeightConfig.findMany({
      where: {
        isActive: true,
        ...(version ? { version } : {}),
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }],
        effectiveFrom: { lte: new Date() },
      },
      orderBy: { factor: 'asc' },
    });
  },

  findActiveRules() {
    return prisma.leadScoringRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { factor: 'asc' }],
    });
  },

  createScore(data: Prisma.LeadScoreCreateInput) {
    return prisma.leadScore.create({ data });
  },

  createHistory(data: Prisma.LeadScoreHistoryCreateInput) {
    return prisma.leadScoreHistory.create({ data });
  },

  createRiskProfile(data: Prisma.LeadRiskProfileCreateInput) {
    return prisma.leadRiskProfile.create({ data });
  },

  createPrediction(data: Prisma.LeadPredictionCreateInput) {
    return prisma.leadPrediction.create({ data });
  },

  createAudit(data: Prisma.LeadScoringAuditCreateInput) {
    return prisma.leadScoringAudit.create({ data });
  },

  findLatestScore(leadId: string) {
    return prisma.leadScore.findFirst({
      where: { leadId },
      orderBy: { calculatedAt: 'desc' },
    });
  },

  listHistory(leadId: string, limit = 20) {
    return prisma.leadScoreHistory.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  listRules(where: Prisma.LeadScoringRuleWhereInput, skip: number, take: number, orderBy: Prisma.LeadScoringRuleOrderByWithRelationInput) {
    return prisma.leadScoringRule.findMany({ where, skip, take, orderBy });
  },

  countRules(where: Prisma.LeadScoringRuleWhereInput) {
    return prisma.leadScoringRule.count({ where });
  },

  findRuleById(id: string) {
    return prisma.leadScoringRule.findUnique({ where: { id } });
  },

  findRuleByCode(code: string) {
    return prisma.leadScoringRule.findUnique({ where: { code } });
  },

  createRule(data: Prisma.LeadScoringRuleCreateInput) {
    return prisma.leadScoringRule.create({ data });
  },

  updateRule(id: string, data: Prisma.LeadScoringRuleUpdateInput) {
    return prisma.leadScoringRule.update({ where: { id }, data });
  },

  listWeights(where: Prisma.LeadWeightConfigWhereInput, skip: number, take: number, orderBy: Prisma.LeadWeightConfigOrderByWithRelationInput) {
    return prisma.leadWeightConfig.findMany({ where, skip, take, orderBy });
  },

  countWeights(where: Prisma.LeadWeightConfigWhereInput) {
    return prisma.leadWeightConfig.count({ where });
  },

  upsertWeight(version: string, factor: string, weight: number, createdById?: string) {
    return prisma.leadWeightConfig.upsert({
      where: { version_factor: { version, factor } },
      create: {
        version,
        factor,
        weight,
        isActive: true,
        effectiveFrom: new Date(),
        createdById,
      },
      update: { weight, isActive: true, updatedAt: new Date() },
    });
  },

  deactivateWeights(version: string, factors: string[]) {
    return prisma.leadWeightConfig.updateMany({
      where: { version, factor: { in: factors } },
      data: { isActive: false, effectiveTo: new Date() },
    });
  },

  analyticsGroupByGrade(where: Prisma.LeadScoreWhereInput) {
    return prisma.leadScore.groupBy({
      by: ['grade'],
      where,
      _count: { id: true },
      _avg: { score: true, approvalProbability: true, disbursalProbability: true },
    });
  },

  analyticsGroupByRisk(where: Prisma.LeadScoreWhereInput) {
    return prisma.leadScore.groupBy({
      by: ['riskRating'],
      where: { ...where, riskRating: { not: null } },
      _count: { id: true },
    });
  },

  analyticsGroupByPriority(where: Prisma.LeadScoreWhereInput) {
    return prisma.leadScore.groupBy({
      by: ['priorityLevel'],
      where: { ...where, priorityLevel: { not: null } },
      _count: { id: true },
    });
  },

  countScores(where: Prisma.LeadScoreWhereInput) {
    return prisma.leadScore.count({ where });
  },

  countAccuratePredictions() {
    return prisma.leadPrediction.count({ where: { wasAccurate: true } });
  },

  countTotalPredictions() {
    return prisma.leadPrediction.count();
  },
};
