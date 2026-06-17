import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  GovernanceAnalyticsQuery,
  ListSecurityAlertsQuery,
  ListSecurityEventsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { governanceRepository } from '../repositories/governance.repository.js';

function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const securityService = {
  async dashboard(_actor: AuthenticatedUser, query: GovernanceAnalyticsQuery) {
    const dateFilter = query.fromDate || query.toDate
      ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
      : {};

    const [totalEvents, openAlerts, criticalAlerts, failedLogins, byType, aiAbuse] = await Promise.all([
      governanceRepository.securityEvent.count(dateFilter),
      governanceRepository.securityAlert.count({ status: { in: ['OPEN', 'INVESTIGATING', 'ACKNOWLEDGED'] } }),
      governanceRepository.securityAlert.count({ severity: 'CRITICAL', status: 'OPEN' }),
      governanceRepository.securityEvent.count({ eventType: 'FAILED_LOGIN', ...dateFilter }),
      prisma.securityEvent.groupBy({ by: ['eventType'], where: dateFilter, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
      governanceRepository.securityEvent.count({ eventType: 'AI_PROMPT_ABUSE', ...dateFilter }),
    ]);

    const securityScore = Math.max(0, Math.min(100, 100 - openAlerts * 8 - criticalAlerts * 15));

    return {
      summary: {
        securityScore,
        totalEvents,
        openAlerts,
        criticalAlerts,
        failedLogins,
        aiPromptAbuse: aiAbuse,
      },
      byEventType: byType.map((e) => ({ eventType: e.eventType, count: e._count.id })),
    };
  },

  async listEvents(_actor: AuthenticatedUser, query: ListSecurityEventsQuery) {
    const where = {
      ...(query.eventType ? { eventType: query.eventType as never } : {}),
      ...(query.severity ? { severity: query.severity as never } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.fromDate || query.toDate
        ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      governanceRepository.securityEvent.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: { user: { select: { id: true, email: true } } },
      }),
      governanceRepository.securityEvent.count(where),
    ]);
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },

  async listAlerts(_actor: AuthenticatedUser, query: ListSecurityAlertsQuery) {
    const where = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.severity ? { severity: query.severity as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      governanceRepository.securityAlert.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: { event: true, assignedTo: { select: { email: true } } },
      }),
      governanceRepository.securityAlert.count(where),
    ]);
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },

  async updateAlert(actor: AuthenticatedUser, alertId: string, status: string, assignedToId?: string) {
    const alert = await prisma.securityAlert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundError('SecurityAlert', alertId);

    return governanceRepository.securityAlert.update(alertId, {
      status: status as never,
      assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      resolvedBy: ['RESOLVED', 'FALSE_POSITIVE'].includes(status) ? { connect: { id: actor.id } } : undefined,
      resolvedAt: ['RESOLVED', 'FALSE_POSITIVE'].includes(status) ? new Date() : undefined,
    });
  },

  async threatDashboard(_actor: AuthenticatedUser, query: GovernanceAnalyticsQuery) {
    const dateFilter = query.fromDate || query.toDate
      ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
      : {};

    const [failedLogins, lockouts, aiAbuse, apiAbuse, permissionEscalation, openAlerts] = await Promise.all([
      governanceRepository.securityEvent.count({ eventType: 'FAILED_LOGIN', ...dateFilter }),
      governanceRepository.securityEvent.count({ eventType: 'ACCOUNT_LOCKOUT', ...dateFilter }),
      governanceRepository.securityEvent.count({ eventType: 'AI_PROMPT_ABUSE', ...dateFilter }),
      governanceRepository.securityEvent.count({ eventType: 'API_ABUSE', ...dateFilter }),
      governanceRepository.securityEvent.count({ eventType: 'PERMISSION_ESCALATION', ...dateFilter }),
      governanceRepository.securityAlert.count({ status: { in: ['OPEN', 'INVESTIGATING'] } }),
    ]);

    return {
      summary: {
        failedLogins,
        accountLockouts: lockouts,
        aiPromptAbuse: aiAbuse,
        apiAbuse,
        permissionViolations: permissionEscalation,
        openAlerts,
        threatLevel: openAlerts > 5 || aiAbuse > 10 ? 'HIGH' : openAlerts > 0 ? 'MEDIUM' : 'LOW',
      },
    };
  },

  async aiGovernance(_actor: AuthenticatedUser, query: GovernanceAnalyticsQuery) {
    const dateFilter = query.fromDate || query.toDate
      ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
      : {};

    const [totalRequests, totalUsage, tokenSum, costSum, errorCount, byModule] = await Promise.all([
      prisma.aiRequest.count({ where: dateFilter }),
      prisma.aiUsageLog.count({ where: dateFilter }),
      prisma.aiUsageLog.aggregate({ where: dateFilter, _sum: { totalTokens: true } }),
      prisma.aiCostLog.aggregate({ where: dateFilter, _sum: { totalCost: true } }),
      prisma.aiRequest.count({ where: { ...dateFilter, status: 'FAILED' } }),
      prisma.aiUsageLog.groupBy({ by: ['module'], where: dateFilter, _count: { id: true }, _sum: { totalTokens: true } }),
    ]);

    return {
      summary: {
        totalRequests,
        totalUsageLogs: totalUsage,
        totalTokens: tokenSum._sum.totalTokens ?? 0,
        totalCost: Number(costSum._sum.totalCost ?? 0),
        errorRate: totalRequests > 0 ? Math.round((errorCount / totalRequests) * 100) : 0,
      },
      byModule: byModule.map((m) => ({
        module: m.module,
        count: m._count.id,
        tokens: m._sum.totalTokens ?? 0,
      })),
    };
  },
};
