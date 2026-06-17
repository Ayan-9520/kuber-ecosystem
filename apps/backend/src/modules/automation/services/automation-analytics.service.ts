import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AutomationAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { automationRepository } from '../repositories/automation.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

function periodBounds(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'day':
      start.setDate(end.getDate() - 1);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1);
  }
  return { start, end };
}

export const automationAnalyticsService = {
  async dashboard(_actor: AuthenticatedUser, query: AutomationAnalyticsQuery) {
    const { start, end } = periodBounds(query.period);
    const from = query.fromDate ?? start;
    const to = query.toDate ?? end;

    const where = {
      createdAt: { gte: from, lte: to },
      ...(query.workflowId ? { workflowId: query.workflowId } : {}),
    };

    const [totalRuns, successes, failures, goals, revenue] = await Promise.all([
      automationRepository.execution.count(where),
      automationRepository.execution.count({ ...where, status: { in: ['COMPLETED', 'GOAL_ACHIEVED'] } }),
      automationRepository.execution.count({ ...where, status: 'FAILED' }),
      automationRepository.execution.count({ ...where, goalAchieved: true }),
      prisma.automationExecution.aggregate({
        where,
        _sum: { revenueAmount: true },
      }),
    ]);

    const successRate = totalRuns ? (successes / totalRuns) * 100 : 0;
    const conversionRate = totalRuns ? (goals / totalRuns) * 100 : 0;
    const dropOffRate = totalRuns ? ((totalRuns - successes) / totalRuns) * 100 : 0;
    const revenueGenerated = Number(revenue._sum.revenueAmount ?? 0);
    const roi = revenueGenerated > 0 ? (revenueGenerated / Math.max(totalRuns, 1)) * 0.15 : 0;

    const channelLogs = await prisma.automationLog.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        message: { contains: 'channel' },
      },
      take: 500,
      select: { metadata: true },
    });

    const channelBreakdown: Record<string, number> = { EMAIL: 0, SMS: 0, WHATSAPP: 0, PUSH: 0 };
    for (const log of channelLogs) {
      const ch = (log.metadata as Record<string, unknown>)?.channel;
      if (typeof ch === 'string' && ch in channelBreakdown) channelBreakdown[ch]! += 1;
    }

    const workflowPerformance = await prisma.automationExecution.groupBy({
      by: ['workflowId'],
      where,
      _count: { id: true },
    });

    const workflows = await prisma.automationWorkflow.findMany({
      where: { id: { in: workflowPerformance.map((w) => w.workflowId) } },
      select: { id: true, name: true, journeyType: true },
    });

    return {
      summary: {
        totalRuns,
        successRate: Math.round(successRate * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropOffRate: Math.round(dropOffRate * 100) / 100,
        revenueGenerated,
        roi: Math.round(roi * 100) / 100,
        goalAchievements: goals,
        failures,
      },
      channelPerformance: channelBreakdown,
      journeyPerformance: workflowPerformance.map((wp) => ({
        workflowId: wp.workflowId,
         runs: wp._count.id,
        workflow: workflows.find((w) => w.id === wp.workflowId),
      })),
      period: { from, to, preset: query.period },
    };
  },

  async list(_actor: AuthenticatedUser, query: AutomationAnalyticsQuery) {
    const where = {
      ...(query.workflowId ? { workflowId: query.workflowId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            periodStart: { gte: query.fromDate },
            periodEnd: { lte: query.toDate },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      automationRepository.analytics.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { periodStart: 'desc' },
        include: { workflow: { select: { id: true, name: true, journeyType: true } } },
      }),
      automationRepository.analytics.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },
};
