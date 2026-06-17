import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateRiskAssessmentInput,
  CreateRiskRegisterInput,
  GovernanceAnalyticsQuery,
  ListRiskRegisterQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { governanceRepository } from '../repositories/governance.repository.js';

function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

function calcRiskScore(likelihood: number, impact: number) {
  return Math.round((likelihood * impact) / 100);
}

export const riskService = {
  async dashboard(_actor: AuthenticatedUser, query: GovernanceAnalyticsQuery) {
    const dateFilter = query.fromDate || query.toDate
      ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
      : {};

    const [totalRisks, openRisks, criticalRisks, byType, recentEvents, avgScore] = await Promise.all([
      governanceRepository.riskRegister.count({}),
      governanceRepository.riskRegister.count({ status: { in: ['IDENTIFIED', 'ASSESSING', 'MITIGATING'] } }),
      governanceRepository.riskRegister.count({ severity: 'CRITICAL' }),
      prisma.riskRegister.groupBy({ by: ['riskType'], _count: { id: true } }),
      governanceRepository.riskEvent.findMany({ where: dateFilter, take: 10, orderBy: { createdAt: 'desc' } }),
      prisma.riskRegister.aggregate({ _avg: { riskScore: true } }),
    ]);

    const riskScore = Math.max(0, Math.min(100, 100 - (criticalRisks * 15 + openRisks * 3)));

    return {
      summary: {
        riskScore,
        totalRisks,
        openRisks,
        criticalRisks,
        avgRiskScore: Math.round(avgScore._avg.riskScore ?? 0),
        recentEventCount: recentEvents.length,
      },
      byType: byType.map((t) => ({ riskType: t.riskType, count: t._count.id })),
      recentEvents,
    };
  },

  async listRegister(_actor: AuthenticatedUser, query: ListRiskRegisterQuery) {
    const where = {
      ...(query.riskType ? { riskType: query.riskType as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.severity ? { severity: query.severity as never } : {}),
      ...(query.search
        ? { OR: [{ title: { contains: query.search } }, { code: { contains: query.search } }] }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      governanceRepository.riskRegister.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: { owner: { select: { email: true } } },
      }),
      governanceRepository.riskRegister.count(where),
    ]);
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },

  async createRegister(actor: AuthenticatedUser, input: CreateRiskRegisterInput) {
    const existing = await prisma.riskRegister.findUnique({ where: { code: input.code } });
    if (existing) throw new ConflictError(`Risk code "${input.code}" already exists`);

    const riskScore = calcRiskScore(input.likelihood, input.impact);
    return governanceRepository.riskRegister.create({
      code: input.code,
      title: input.title,
      description: input.description,
      riskType: input.riskType as never,
      severity: input.severity as never,
      likelihood: input.likelihood,
      impact: input.impact,
      riskScore,
      mitigationPlan: input.mitigationPlan,
      owner: input.ownerId ? { connect: { id: input.ownerId } } : undefined,
      createdBy: { connect: { id: actor.id } },
    });
  },

  async getRegister(_actor: AuthenticatedUser, id: string) {
    const item = await governanceRepository.riskRegister.findById(id);
    if (!item) throw new NotFoundError('RiskRegister', id);
    return item;
  },

  async createAssessment(actor: AuthenticatedUser, input: CreateRiskAssessmentInput) {
    const risk = await governanceRepository.riskRegister.findById(input.riskId);
    if (!risk) throw new NotFoundError('RiskRegister', input.riskId);

    const riskScore = calcRiskScore(input.likelihood, input.impact);
    const assessment = await governanceRepository.riskAssessment.create({
      risk: { connect: { id: input.riskId } },
      assessor: { connect: { id: actor.id } },
      likelihood: input.likelihood,
      impact: input.impact,
      riskScore,
      notes: input.notes,
    });

    await governanceRepository.riskRegister.update(input.riskId, {
      likelihood: input.likelihood,
      impact: input.impact,
      riskScore,
      status: 'ASSESSING',
    });

    return assessment;
  },

  async listEvents(_actor: AuthenticatedUser, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      governanceRepository.riskEvent.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      governanceRepository.riskEvent.count({}),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  },
};
