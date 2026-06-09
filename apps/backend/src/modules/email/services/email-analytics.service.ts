import type { EmailAnalyticsQuery } from '@kuberone/shared-validation';

import { emailAnalyticsRepository } from '../repositories/email.repository.js';
import { pct } from '../utils/email.utils.js';

export const emailAnalyticsService = {
  async getSummary(query: EmailAnalyticsQuery) {
    const groups = await emailAnalyticsRepository.aggregate(query.fromDate, query.toDate);
    const templatePerf = await emailAnalyticsRepository.templatePerformance(query.fromDate, query.toDate);

    const totals = groups.reduce(
      (acc, g) => ({
        sent: acc.sent + (g._sum.sentCount ?? 0),
        delivered: acc.delivered + (g._sum.deliveredCount ?? 0),
        opened: acc.opened + (g._sum.openedCount ?? 0),
        clicked: acc.clicked + (g._sum.clickedCount ?? 0),
        bounced: acc.bounced + (g._sum.bouncedCount ?? 0),
        failed: acc.failed + (g._sum.failedCount ?? 0),
        unsubscribed: acc.unsubscribed + (g._sum.unsubscribedCount ?? 0),
      }),
      { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0, unsubscribed: 0 },
    );

    return {
      emailsSent: totals.sent,
      deliveryRate: pct(totals.delivered, totals.sent),
      openRate: pct(totals.opened, totals.sent),
      clickRate: pct(totals.clicked, totals.sent),
      bounceRate: pct(totals.bounced, totals.sent),
      failureRate: pct(totals.failed, totals.sent),
      unsubscribedCount: totals.unsubscribed,
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
        opened: t._sum.openedCount ?? 0,
        clicked: t._sum.clickedCount ?? 0,
        failed: t._sum.failedCount ?? 0,
        openRate: pct(t._sum.openedCount ?? 0, t._sum.sentCount ?? 0),
      })),
    };
  },
};
