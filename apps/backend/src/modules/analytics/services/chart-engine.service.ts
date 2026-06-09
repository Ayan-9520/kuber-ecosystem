import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AnalyticsRevenueQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import type { ChartSeries } from '../types/analytics.types.js';
import { scopedQuery } from '../utils/analytics-date.utils.js';
import { applyAnalyticsScope } from '../utils/analytics-scope.utils.js';

export const chartEngineService = {
  async revenueTrend(actor: AuthenticatedUser, rawQuery: AnalyticsRevenueQuery) {
    const query = scopedQuery(applyAnalyticsScope(actor, rawQuery));
    const groupBy = rawQuery.groupBy ?? 'day';

    if (groupBy === 'branch') {
      const rows = await prisma.disbursement.groupBy({
        by: ['applicationId'],
        where: { createdAt: { gte: query.fromDate, lte: query.toDate } },
        _sum: { disbursementAmount: true },
      });
      const apps = await prisma.application.findMany({
        where: { id: { in: rows.map((r) => r.applicationId) } },
        select: { id: true, branchId: true, branch: { select: { name: true } } },
      });
      const map = new Map<string, number>();
      for (const row of rows) {
        const app = apps.find((a) => a.id === row.applicationId);
        const label = app?.branch?.name ?? 'Unknown';
        map.set(label, (map.get(label) ?? 0) + Number(row._sum.disbursementAmount ?? 0));
      }
      const series: ChartSeries = {
        label: 'Revenue by Branch',
        data: [...map.entries()].map(([x, y]) => ({ x, y: Math.round(y * 100) / 100 })),
      };
      return { chartType: 'BAR', series: [series] };
    }

    const disbursements = await prisma.disbursement.findMany({
      where: { createdAt: { gte: query.fromDate, lte: query.toDate } },
      select: { createdAt: true, disbursementAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets = new Map<string, number>();
    for (const d of disbursements) {
      const key =
        groupBy === 'month'
          ? `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`
          : groupBy === 'week'
            ? `W${Math.ceil(d.createdAt.getDate() / 7)}-${d.createdAt.getFullYear()}`
            : d.createdAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + Number(d.disbursementAmount ?? 0));
    }

    const series: ChartSeries = {
      label: 'Revenue Trend',
      data: [...buckets.entries()].map(([x, y]) => ({ x, y: Math.round(y * 100) / 100 })),
    };

    return {
      chartType: groupBy === 'day' ? 'LINE' : 'AREA',
      series: [series],
    };
  },

  async leadFunnel(actor: AuthenticatedUser, rawQuery: AnalyticsRevenueQuery) {
    const query = scopedQuery(applyAnalyticsScope(actor, rawQuery));
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED', 'LOST'] as const;
    const counts = await Promise.all(
      statuses.map((status) =>
        prisma.lead.count({
          where: {
            deletedAt: null,
            status,
            createdAt: { gte: query.fromDate, lte: query.toDate },
            ...(query.branchId ? { branchId: query.branchId } : {}),
            ...(query.regionId ? { regionId: query.regionId } : {}),
          },
        }),
      ),
    );
    return {
      chartType: 'BAR',
      series: [
        {
          label: 'Lead Funnel',
          data: statuses.map((status, i) => ({ x: status, y: counts[i] ?? 0 })),
        },
      ],
    };
  },
};
