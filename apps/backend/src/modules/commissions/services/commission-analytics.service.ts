import type { Prisma } from '@kuberone/database';
import type { CommissionAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { commissionLedgerRepository } from '../repositories/commission.repository.js';
import { roundMoney } from '../utils/commissions.utils.js';

function dateFilter(query: CommissionAnalyticsQuery): Prisma.CommissionLedgerWhereInput {
  return {
    deletedAt: null,
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
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

export const commissionAnalyticsService = {
  async getSummary(query: CommissionAnalyticsQuery) {
    const where = dateFilter(query);

    const [totalAgg, outstandingAgg, paidAgg, recoveredAgg, partnerGroups, branchGroups, productGroups, typeGroups] =
      await Promise.all([
        commissionLedgerRepository.aggregate(where),
        commissionLedgerRepository.aggregate({ ...where, status: { in: ['CALCULATED', 'APPROVED'] } }),
        commissionLedgerRepository.aggregate({ ...where, status: 'PAID' }),
        commissionLedgerRepository.aggregate({ ...where, status: 'RECOVERED' }),
        query.groupBy === 'partner' ? commissionLedgerRepository.groupByPartner(where) : Promise.resolve([]),
        query.groupBy === 'branch' ? commissionLedgerRepository.groupByBranch(where) : Promise.resolve([]),
        query.groupBy === 'product' ? commissionLedgerRepository.groupByProduct(where) : Promise.resolve([]),
        query.groupBy === 'commissionType' ? commissionLedgerRepository.groupByType(where) : Promise.resolve([]),
      ]);

    const partnerEarnings = await enrichPartnerGroups(
      query.groupBy === 'partner' ? partnerGroups : await commissionLedgerRepository.groupByPartner(where),
    );

    return {
      partnerEarnings,
      commissionOutstanding: roundMoney(Number(outstandingAgg._sum.commissionAmount ?? 0)),
      paidCommissions: roundMoney(Number(paidAgg._sum.commissionAmount ?? 0)),
      recoverySummary: {
        totalRecovered: roundMoney(Number(recoveredAgg._sum.commissionAmount ?? 0)),
        count: recoveredAgg._count,
      },
      branchPerformance:
        query.groupBy === 'branch'
          ? branchGroups
          : await commissionLedgerRepository.groupByBranch(where),
      productPerformance:
        query.groupBy === 'product'
          ? productGroups
          : await commissionLedgerRepository.groupByProduct(where),
      commissionTypeBreakdown:
        query.groupBy === 'commissionType'
          ? typeGroups
          : await commissionLedgerRepository.groupByType(where),
      totals: {
        totalCommission: roundMoney(Number(totalAgg._sum.commissionAmount ?? 0)),
        entryCount: totalAgg._count,
      },
    };
  },
};

async function enrichPartnerGroups(
  groups: Array<{ partnerId: string; status: string; _sum: { commissionAmount: unknown }; _count: number }>,
) {
  const partnerIds = [...new Set(groups.map((g) => g.partnerId))];
  const partners = await prisma.partner.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, partnerCode: true, businessName: true, contactName: true },
  });

  const map = new Map(partners.map((p) => [p.id, p]));
  const byPartner = new Map<string, { partner: (typeof partners)[0]; total: number; byStatus: Record<string, number> }>();

  for (const group of groups) {
    const partner = map.get(group.partnerId);
    if (!partner) continue;
    const existing = byPartner.get(group.partnerId) ?? { partner, total: 0, byStatus: {} };
    const amount = Number(group._sum.commissionAmount ?? 0);
    existing.total = roundMoney(existing.total + amount);
    existing.byStatus[group.status] = roundMoney(amount);
    byPartner.set(group.partnerId, existing);
  }

  return [...byPartner.values()].sort((a, b) => b.total - a.total);
}
