import type { LosAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { SANCTIONED_PLUS_STATUSES } from '../constants/applications.constants.js';
import { applicationRepository } from '../repositories/application.repository.js';
import type { LosAnalyticsSummary } from '../types/applications.types.js';

function buildWhere(query: LosAnalyticsQuery) {
  return {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.assignedSalesId ? { assignedSalesId: query.assignedSalesId } : {}),
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

export const losAnalyticsService = {
  async getSummary(query: LosAnalyticsQuery): Promise<LosAnalyticsSummary> {
    const where = buildWhere(query);

    const [totalApplications, submitted, sanctioned, disbursed, rejected, byStatus, byAssignee, byBranch, avgTatDays] =
      await Promise.all([
        applicationRepository.count(where),
        applicationRepository.count({ ...where, status: { not: 'DRAFT' } }),
        applicationRepository.count({ ...where, status: { in: [...SANCTIONED_PLUS_STATUSES] } }),
        applicationRepository.count({ ...where, status: 'DISBURSED' }),
        applicationRepository.count({ ...where, status: 'REJECTED' }),
        applicationRepository.groupByStatus(where),
        applicationRepository.groupByAssignee(where),
        applicationRepository.groupByBranch(where),
        applicationRepository.avgTatDays(where),
      ]);

    const reviewed = submitted - (await applicationRepository.count({ ...where, status: 'DRAFT' }));
    const approvalRate = reviewed > 0 ? Math.round((sanctioned / reviewed) * 1000) / 10 : 0;
    const disbursementRate = sanctioned > 0 ? Math.round((disbursed / sanctioned) * 1000) / 10 : 0;

    const assigneeIds = byAssignee.map((a) => a.assignedSalesId).filter(Boolean) as string[];
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
        const w = { ...where, assignedSalesId: employeeId };
        const [total, sanc, disb, rej] = await Promise.all([
          applicationRepository.count(w),
          applicationRepository.count({ ...w, status: { in: [...SANCTIONED_PLUS_STATUSES] } }),
          applicationRepository.count({ ...w, status: 'DISBURSED' }),
          applicationRepository.count({ ...w, status: 'REJECTED' }),
        ]);
        return {
          employeeId,
          employeeName: employeeMap.get(employeeId) ?? employeeId,
          total,
          sanctioned: sanc,
          disbursed: disb,
          rejected: rej,
        };
      }),
    );

    const branchPerformance = await Promise.all(
      branchIds.map(async (branchId) => {
        const w = { ...where, branchId };
        const [total, sanc, disb, rej] = await Promise.all([
          applicationRepository.count(w),
          applicationRepository.count({ ...w, status: { in: [...SANCTIONED_PLUS_STATUSES] } }),
          applicationRepository.count({ ...w, status: 'DISBURSED' }),
          applicationRepository.count({ ...w, status: 'REJECTED' }),
        ]);
        return {
          branchId,
          branchName: branchMap.get(branchId) ?? branchId,
          total,
          sanctioned: sanc,
          disbursed: disb,
          rejected: rej,
        };
      }),
    );

    return {
      totalApplications,
      submitted,
      sanctioned,
      disbursed,
      rejected,
      approvalRate,
      disbursementRate,
      avgTatDays,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
      executivePerformance,
      branchPerformance,
    };
  },
};
