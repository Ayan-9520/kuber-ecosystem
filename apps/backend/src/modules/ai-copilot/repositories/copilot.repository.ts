import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const copilotRepository = {
  createSession(data: Prisma.AiCopilotSessionCreateInput) {
    return prisma.aiCopilotSession.create({ data });
  },

  endSession(sessionId: string) {
    return prisma.aiCopilotSession.update({
      where: { id: sessionId },
      data: { status: 'ENDED', endedAt: new Date() },
    });
  },

  createInsight(data: Prisma.AiInsightCreateInput) {
    return prisma.aiInsight.create({ data });
  },

  createRecommendation(data: Prisma.AiRecommendationCreateInput) {
    return prisma.aiRecommendation.create({ data });
  },

  createPrediction(data: Prisma.AiPredictionCreateInput) {
    return prisma.aiPrediction.create({ data });
  },

  createRiskFlag(data: Prisma.AiRiskFlagCreateInput) {
    return prisma.aiRiskFlag.create({ data });
  },

  createActionSuggestion(data: Prisma.AiActionSuggestionCreateInput) {
    return prisma.aiActionSuggestion.create({ data });
  },

  createFeedback(data: Prisma.AiCopilotFeedbackCreateInput) {
    return prisma.aiCopilotFeedback.create({ data });
  },

  updateRecommendationAcceptance(id: string, accepted: boolean) {
    return prisma.aiRecommendation.update({
      where: { id },
      data: { accepted, acceptedAt: accepted ? new Date() : null },
    });
  },

  listInsights(query: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    category?: string;
    limit?: number;
  }) {
    return prisma.aiInsight.findMany({
      where: {
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.entityType ? { entityType: query.entityType as never } : {}),
        ...(query.entityId ? { entityId: query.entityId } : {}),
        ...(query.category ? { category: query.category as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
    });
  },

  listRecommendations(query: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    recommendationType?: string;
    limit?: number;
  }) {
    return prisma.aiRecommendation.findMany({
      where: {
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.entityType ? { entityType: query.entityType as never } : {}),
        ...(query.entityId ? { entityId: query.entityId } : {}),
        ...(query.recommendationType ? { recommendationType: query.recommendationType as never } : {}),
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: query.limit ?? 20,
    });
  },

  countSessions(where: Prisma.AiCopilotSessionWhereInput) {
    return prisma.aiCopilotSession.count({ where });
  },

  countRecommendations(where: Prisma.AiRecommendationWhereInput) {
    return prisma.aiRecommendation.count({ where });
  },

  countAcceptedRecommendations(where: Prisma.AiRecommendationWhereInput) {
    return prisma.aiRecommendation.count({ where: { ...where, accepted: true } });
  },

  countPredictions(where: Prisma.AiPredictionWhereInput) {
    return prisma.aiPrediction.count({ where });
  },

  countAccuratePredictions(where: Prisma.AiPredictionWhereInput) {
    return prisma.aiPrediction.count({ where: { ...where, wasAccurate: true } });
  },

  groupSessionsByEntity(where: Prisma.AiCopilotSessionWhereInput) {
    return prisma.aiCopilotSession.groupBy({
      by: ['entityType'],
      where,
      _count: { id: true },
    });
  },
};
