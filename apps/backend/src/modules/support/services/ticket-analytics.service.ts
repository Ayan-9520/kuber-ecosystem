import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { TicketAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { applyTicketScope } from '../../../shared/utils/data-scope.js';
import { ticketCategoryRepository, ticketRepository } from '../repositories/ticket.repository.js';
import type { TicketAnalyticsSummary } from '../types/support.types.js';

function buildAnalyticsWhere(query: TicketAnalyticsQuery): Prisma.TicketWhereInput {
  return {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.assignedUserId ? { assignedUserId: query.assignedUserId } : {}),
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

export const ticketAnalyticsService = {
  async getSummary(actor: AuthenticatedUser, query: TicketAnalyticsQuery): Promise<TicketAnalyticsSummary> {
    const baseWhere = buildAnalyticsWhere(query);
    const where = applyTicketScope(actor, baseWhere);

    const [
      openTickets,
      resolvedTickets,
      closedTickets,
      slaBreaches,
      byStatusRows,
      byPriorityRows,
      byCategoryRows,
      byBranchRows,
      byAssigneeRows,
      resolvedWithDuration,
    ] = await Promise.all([
      ticketRepository.count({ ...where, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_INTERNAL'] } }),
      ticketRepository.count({ ...where, status: 'RESOLVED' }),
      ticketRepository.count({ ...where, status: 'CLOSED' }),
      ticketRepository.count({ ...where, slaBreached: true }),
      ticketRepository.groupByStatus(where),
      ticketRepository.groupByPriority(where),
      ticketRepository.groupByCategory(where),
      ticketRepository.groupByBranch(where),
      ticketRepository.groupByAssignee(where),
      prisma.ticket.findMany({
        where: { ...where, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const row of byStatusRows) {
      byStatus[row.status] = row._count.id;
    }

    const byPriority: Record<string, number> = {};
    for (const row of byPriorityRows) {
      byPriority[row.priority] = row._count.id;
    }

    const categories = await ticketCategoryRepository.list({}, 0, 100, { sortOrder: 'asc' });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const byCategory = byCategoryRows.map((row) => ({
      categoryId: row.categoryId,
      categoryName: categoryMap.get(row.categoryId) ?? 'Unknown',
      count: row._count.id,
    }));

    const branchIds = byBranchRows.map((r) => r.branchId).filter(Boolean) as string[];
    const branches =
      branchIds.length > 0
        ? await prisma.branch.findMany({
            where: { id: { in: branchIds } },
            select: { id: true, name: true },
          })
        : [];
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));

    const branchPerformance = await Promise.all(
      byBranchRows
        .filter((r) => r.branchId)
        .map(async (row) => {
          const branchWhere = { ...where, branchId: row.branchId! };
          const [open, resolved] = await Promise.all([
            ticketRepository.count({
              ...branchWhere,
              status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_INTERNAL'] },
            }),
            ticketRepository.count({ ...branchWhere, status: { in: ['RESOLVED', 'CLOSED'] } }),
          ]);
          return {
            branchId: row.branchId!,
            branchName: branchMap.get(row.branchId!) ?? 'Unknown',
            total: row._count.id,
            open,
            resolved,
          };
        }),
    );

    const assigneeIds = byAssigneeRows.map((r) => r.assignedUserId).filter(Boolean) as string[];
    const users =
      assigneeIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: assigneeIds } },
            select: { id: true, email: true, phone: true },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u.email ?? u.phone ?? u.id]));

    const executivePerformance = await Promise.all(
      byAssigneeRows
        .filter((r) => r.assignedUserId)
        .map(async (row) => {
          const execWhere = { ...where, assignedUserId: row.assignedUserId! };
          const resolvedCount = await ticketRepository.count({
            ...execWhere,
            status: { in: ['RESOLVED', 'CLOSED'] },
          });
          const execResolved = await prisma.ticket.findMany({
            where: { ...execWhere, resolvedAt: { not: null } },
            select: { createdAt: true, resolvedAt: true },
          });
          const avgHours =
            execResolved.length > 0
              ? execResolved.reduce((sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) /
                execResolved.length /
                3600000
              : 0;

          return {
            assignedUserId: row.assignedUserId!,
            assignedUserName: userMap.get(row.assignedUserId!) ?? 'Unknown',
            total: row._count.id,
            resolved: resolvedCount,
            avgResolutionHours: Math.round(avgHours * 100) / 100,
          };
        }),
    );

    const avgResolutionHours =
      resolvedWithDuration.length > 0
        ? Math.round(
            (resolvedWithDuration.reduce(
              (sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()),
              0,
            ) /
              resolvedWithDuration.length /
              3600000) *
              100,
          ) / 100
        : 0;

    return {
      openTickets,
      resolvedTickets,
      closedTickets,
      slaBreaches,
      avgResolutionHours,
      byStatus,
      byPriority,
      byCategory,
      executivePerformance,
      branchPerformance,
    };
  },
};
