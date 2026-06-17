import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateComplianceReportInput,
  GovernanceAnalyticsQuery,
  ListComplianceViolationsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { governanceRepository } from '../repositories/governance.repository.js';

function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const complianceService = {
  async dashboard(_actor: AuthenticatedUser, query: GovernanceAnalyticsQuery) {
    const dateFilter = query.fromDate || query.toDate
      ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
      : {};

    const [openViolations, resolvedViolations, rules, byFramework, dataAccessCount, policies] = await Promise.all([
      governanceRepository.complianceViolation.count({ status: 'OPEN' }),
      governanceRepository.complianceViolation.count({ status: 'RESOLVED', ...dateFilter }),
      governanceRepository.complianceRule.count({ isActive: true }),
      prisma.complianceViolation.groupBy({
        by: ['severity'],
        where: { status: 'OPEN' },
        _count: { id: true },
      }),
      governanceRepository.dataAccessLog.count(dateFilter),
      governanceRepository.governancePolicy.findMany({ where: { isActive: true }, take: 10 }),
    ]);

    const complianceScore = Math.max(0, Math.min(100, 100 - openViolations * 5));

    return {
      summary: {
        complianceScore,
        openViolations,
        resolvedViolations,
        activeRules: rules,
        dataAccessEvents: dataAccessCount,
        activePolicies: policies.length,
      },
      violationsBySeverity: byFramework.map((v) => ({ severity: v.severity, count: v._count.id })),
      frameworks: ['DPDP', 'KYC', 'AML', 'INTERNAL_POLICY', 'SECURITY', 'OPERATIONAL', 'AUDIT'],
      policies,
    };
  },

  async listViolations(_actor: AuthenticatedUser, query: ListComplianceViolationsQuery) {
    const where = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.severity ? { severity: query.severity as never } : {}),
      ...(query.framework ? { rule: { framework: query.framework as never } } : {}),
      ...(query.fromDate || query.toDate
        ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      governanceRepository.complianceViolation.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: { rule: { select: { code: true, name: true, framework: true } }, user: { select: { email: true } } },
      }),
      governanceRepository.complianceViolation.count(where),
    ]);
    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },

  async resolveViolation(actor: AuthenticatedUser, violationId: string, status: string, comments?: string) {
    const violation = await prisma.complianceViolation.findUnique({ where: { id: violationId } });
    if (!violation) throw new NotFoundError('ComplianceViolation', violationId);

    return governanceRepository.complianceViolation.update(violationId, {
      status: status as never,
      resolvedBy: { connect: { id: actor.id } },
      resolvedAt: new Date(),
      evidence: { ...(violation.evidence as object), resolutionComments: comments },
    });
  },

  async listReports(_actor: AuthenticatedUser, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      governanceRepository.complianceReport.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.complianceReport.count(),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  },

  async generateReport(actor: AuthenticatedUser, input: CreateComplianceReportInput) {
    const openCount = await governanceRepository.complianceViolation.count({
      status: 'OPEN',
      createdAt: { gte: input.periodStart, lte: input.periodEnd },
    });
    const score = Math.max(0, 100 - openCount * 3);

    return governanceRepository.complianceReport.create({
      code: input.code,
      name: input.name,
      framework: input.framework as never,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      complianceScore: score,
      violationCount: openCount,
      format: input.format as never,
      status: 'COMPLETED',
      generatedBy: { connect: { id: actor.id } },
      generatedAt: new Date(),
      summary: { openViolations: openCount, score },
    });
  },

  async listRules(_actor: AuthenticatedUser) {
    return governanceRepository.complianceRule.findMany({
      where: { isActive: true },
      orderBy: { framework: 'asc' },
    });
  },

  async listRetentionPolicies(_actor: AuthenticatedUser) {
    return governanceRepository.retentionPolicy.findMany({ where: { isActive: true } });
  },
};
