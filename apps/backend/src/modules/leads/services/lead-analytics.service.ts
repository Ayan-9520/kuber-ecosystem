import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { LeadAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { applyLeadScope } from '../../../shared/utils/data-scope.js';
import { CONVERTED_STATUSES, GRADE_ALIASES } from '../constants/leads.constants.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { LeadAnalyticsSummary } from '../types/leads.types.js';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildBaseWhere(query: LeadAnalyticsQuery): Prisma.LeadWhereInput {
  return {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
  };
}

export const leadAnalyticsService = {
  async getSummary(
    query: LeadAnalyticsQuery,
    actor?: AuthenticatedUser,
  ): Promise<
    LeadAnalyticsSummary & {
      gradeAliases: typeof GRADE_ALIASES;
      totalLeads: number;
      inProcess: number;
      rejected: number;
      converted: number;
      conversionRate: string;
      conversionPct: number;
      pipelineValue: number;
      byStatusList: Array<{ status: string; count: number }>;
    }
  > {
    const baseWhere = actor ? applyLeadScope(actor, buildBaseWhere(query)) : buildBaseWhere(query);
    const today = startOfToday();

    const [
      totalLeads,
      todayLeads,
      qualifiedLeads,
      hotLeads,
      convertedLeads,
      lostLeads,
      pipelineAgg,
      byStatus,
      byGrade,
      bySource,
      byAssignee,
      byBranch,
    ] = await Promise.all([
      leadRepository.count(baseWhere),
      leadRepository.count({ ...baseWhere, createdAt: { gte: today } }),
      leadRepository.count({ ...baseWhere, status: 'QUALIFIED' }),
      leadRepository.count({ ...baseWhere, grade: { in: ['A_PLUS', 'A'] } }),
      leadRepository.count({ ...baseWhere, status: { in: [...CONVERTED_STATUSES] } }),
      leadRepository.count({ ...baseWhere, status: 'LOST' }),
      prisma.lead.aggregate({
        where: baseWhere,
        _sum: { requestedAmount: true },
      }),
      leadRepository.groupByStatus(baseWhere),
      leadRepository.groupByGrade(baseWhere),
      leadRepository.groupBySource(baseWhere),
      leadRepository.groupByAssignee(baseWhere),
      leadRepository.groupByBranch(baseWhere),
    ]);

    const sourceIds = bySource.map((s) => s.sourceId).filter(Boolean) as string[];
    const sources = sourceIds.length
      ? await prisma.leadSource.findMany({
          where: { id: { in: sourceIds } },
          select: { id: true, name: true },
        })
      : [];
    const sourceMap = new Map(sources.map((s) => [s.id, s.name]));

    const assigneeIds = byAssignee.map((a) => a.assignedToId).filter(Boolean) as string[];
    const employees = assigneeIds.length
      ? await prisma.employee.findMany({
          where: { id: { in: assigneeIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

    const branchIds = byBranch.map((b) => b.branchId).filter(Boolean) as string[];
    const branches = branchIds.length
      ? await prisma.branch.findMany({
          where: { id: { in: branchIds } },
          select: { id: true, name: true },
        })
      : [];
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));

    const executivePerformance = await Promise.all(
      assigneeIds.map(async (employeeId) => {
        const where = { ...baseWhere, assignedToId: employeeId };
        const [total, converted, lost] = await Promise.all([
          leadRepository.count(where),
          leadRepository.count({ ...where, status: { in: [...CONVERTED_STATUSES] } }),
          leadRepository.count({ ...where, status: 'LOST' }),
        ]);
        return {
          employeeId,
          employeeName: employeeMap.get(employeeId) ?? employeeId,
          totalLeads: total,
          converted,
          lost,
        };
      }),
    );

    const branchPerformance = await Promise.all(
      branchIds.map(async (branchId) => {
        const where = { ...baseWhere, branchId };
        const [total, converted, lost] = await Promise.all([
          leadRepository.count(where),
          leadRepository.count({ ...where, status: { in: [...CONVERTED_STATUSES] } }),
          leadRepository.count({ ...where, status: 'LOST' }),
        ]);
        return {
          branchId,
          branchName: branchMap.get(branchId) ?? branchId,
          totalLeads: total,
          converted,
          lost,
        };
      }),
    );

    const byStatusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.id]));
    const inProcess = Math.max(totalLeads - convertedLeads - lostLeads, 0);
    const conversionPct = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      todayLeads,
      qualifiedLeads,
      hotLeads,
      convertedLeads,
      lostLeads,
      inProcess,
      rejected: lostLeads,
      converted: convertedLeads,
      conversionRate: `${conversionPct.toFixed(1)}%`,
      conversionPct,
      pipelineValue: Number(pipelineAgg._sum.requestedAmount ?? 0),
      byStatus: byStatusMap,
      byStatusList: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byGrade: Object.fromEntries(byGrade.map((g) => [g.grade ?? 'UNSCORED', g._count.id])),
      bySource: bySource.map((s) => ({
        sourceId: s.sourceId,
        sourceName: sourceMap.get(s.sourceId) ?? s.sourceId,
        count: s._count.id,
      })),
      executivePerformance,
      branchPerformance,
      gradeAliases: GRADE_ALIASES,
    };
  },
};
