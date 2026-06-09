import type { PushAnalyticsQuery } from '@kuberone/shared-validation';

import { pushAnalyticsRepository } from '../repositories/push.repository.js';
import { pct } from '../utils/push.utils.js';

export const pushAnalyticsService = {
  async getSummary(query: PushAnalyticsQuery) {
    const groups = await pushAnalyticsRepository.aggregate(query.fromDate, query.toDate);
    const templatePerf = await pushAnalyticsRepository.templatePerformance(query.fromDate, query.toDate);
    const providerPerf = await pushAnalyticsRepository.providerPerformance(query.fromDate, query.toDate);
    const topicPerf = await pushAnalyticsRepository.topicPerformance(query.fromDate, query.toDate);

    const totals = groups.reduce(
      (acc, g) => ({
        sent: acc.sent + (g._sum.sentCount ?? 0),
        delivered: acc.delivered + (g._sum.deliveredCount ?? 0),
        opened: acc.opened + (g._sum.openedCount ?? 0),
        clicked: acc.clicked + (g._sum.clickedCount ?? 0),
        failed: acc.failed + (g._sum.failedCount ?? 0),
        dismissed: acc.dismissed + (g._sum.dismissedCount ?? 0),
      }),
      { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, dismissed: 0 },
    );

    return {
      notificationsSent: totals.sent,
      notificationsDelivered: totals.delivered,
      deliveryRate: pct(totals.delivered, totals.sent),
      openRate: pct(totals.opened, totals.sent),
      clickRate: pct(totals.clicked, totals.sent),
      failureRate: pct(totals.failed, totals.sent),
      dismissedRate: pct(totals.dismissed, totals.sent),
      categoryBreakdown: groups.map((g) => ({
        category: g.category ?? 'ALL',
        sent: g._sum.sentCount ?? 0,
        delivered: g._sum.deliveredCount ?? 0,
        opened: g._sum.openedCount ?? 0,
        failed: g._sum.failedCount ?? 0,
      })),
      templatePerformance: templatePerf.map((t) => ({
        templateId: t.templateId,
        sent: t._sum.sentCount ?? 0,
        delivered: t._sum.deliveredCount ?? 0,
        opened: t._sum.openedCount ?? 0,
        failed: t._sum.failedCount ?? 0,
        openRate: pct(t._sum.openedCount ?? 0, t._sum.sentCount ?? 0),
      })),
      providerPerformance: providerPerf.map((p) => ({
        providerId: p.providerId,
        sent: p._sum.sentCount ?? 0,
        delivered: p._sum.deliveredCount ?? 0,
        failed: p._sum.failedCount ?? 0,
        deliveryRate: pct(p._sum.deliveredCount ?? 0, p._sum.sentCount ?? 0),
      })),
      topicPerformance: topicPerf.map((t) => ({
        topicCode: t.topicCode,
        sent: t._sum.sentCount ?? 0,
        delivered: t._sum.deliveredCount ?? 0,
        failed: t._sum.failedCount ?? 0,
      })),
    };
  },
};
