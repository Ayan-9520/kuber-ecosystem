import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { UserType } from '@kuberone/shared-types';

export interface ReferralAnalyticsQuery {
  partnerId?: string;
  referrerPartnerId?: string;
  fromDate?: Date;
  toDate?: Date;
}

function buildWhere(query: ReferralAnalyticsQuery, actor?: AuthenticatedUser): Prisma.ReferralWhereInput {
  const partnerId =
    actor?.userType === UserType.PARTNER && actor.partnerId
      ? actor.partnerId
      : query.referrerPartnerId ?? query.partnerId;

  return {
    deletedAt: null,
    ...(partnerId ? { referrerPartnerId: partnerId } : {}),
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

export const referralAnalyticsService = {
  async getSummary(query: ReferralAnalyticsQuery, actor?: AuthenticatedUser) {
    const where = buildWhere(query, actor);

    const [total, converted, pending, cancelled, rewardAgg, byStatus] = await Promise.all([
      prisma.referral.count({ where }),
      prisma.referral.count({ where: { ...where, status: 'CONVERTED' } }),
      prisma.referral.count({
        where: { ...where, status: { in: ['PENDING', 'ACTIVE'] } },
      }),
      prisma.referral.count({ where: { ...where, status: { in: ['CANCELLED', 'REJECTED'] } } }),
      prisma.referral.aggregate({
        where: { ...where, status: 'CONVERTED' },
        _sum: { rewardAmount: true },
      }),
      prisma.referral.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    const totalRewards = Number(rewardAgg._sum.rewardAmount ?? 0);
    const conversionPct = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      totalReferrals: total,
      converted,
      pending,
      cancelled,
      totalRewards,
      rewardAmount: totalRewards,
      conversionRate: `${conversionPct.toFixed(1)}%`,
      conversionPct,
      byStatus: byStatus.map((row) => ({ status: row.status, count: row._count.id })),
    };
  },
};
