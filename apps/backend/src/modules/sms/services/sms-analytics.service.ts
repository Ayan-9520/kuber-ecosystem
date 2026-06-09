import type { SmsAnalyticsQuery } from '@kuberone/shared-validation';

import { smsAnalyticsRepository } from '../repositories/sms.repository.js';
import { pct } from '../utils/sms.utils.js';

export const smsAnalyticsService = {
  async getSummary(query: SmsAnalyticsQuery) {
    const groups = await smsAnalyticsRepository.aggregate(query.fromDate, query.toDate);
    const templatePerf = await smsAnalyticsRepository.templatePerformance(query.fromDate, query.toDate);
    const providerPerf = await smsAnalyticsRepository.providerPerformance(query.fromDate, query.toDate);

    const totals = groups.reduce(
      (acc, g) => ({
        sent: acc.sent + (g._sum.sentCount ?? 0),
        delivered: acc.delivered + (g._sum.deliveredCount ?? 0),
        failed: acc.failed + (g._sum.failedCount ?? 0),
        rejected: acc.rejected + (g._sum.rejectedCount ?? 0),
        otpSent: acc.otpSent + (g._sum.otpSentCount ?? 0),
        otpVerified: acc.otpVerified + (g._sum.otpVerifiedCount ?? 0),
        otpFailed: acc.otpFailed + (g._sum.otpFailedCount ?? 0),
      }),
      { sent: 0, delivered: 0, failed: 0, rejected: 0, otpSent: 0, otpVerified: 0, otpFailed: 0 },
    );

    return {
      smsSent: totals.sent,
      smsDelivered: totals.delivered,
      deliveryRate: pct(totals.delivered, totals.sent),
      failureRate: pct(totals.failed, totals.sent),
      rejectedRate: pct(totals.rejected, totals.sent),
      otpSent: totals.otpSent,
      otpVerified: totals.otpVerified,
      otpFailed: totals.otpFailed,
      otpSuccessRate: pct(totals.otpVerified, totals.otpSent),
      otpFailureRate: pct(totals.otpFailed, totals.otpSent),
      categoryBreakdown: groups.map((g) => ({
        category: g.category ?? 'ALL',
        sent: g._sum.sentCount ?? 0,
        delivered: g._sum.deliveredCount ?? 0,
        failed: g._sum.failedCount ?? 0,
        otpSent: g._sum.otpSentCount ?? 0,
      })),
      templatePerformance: templatePerf.map((t) => ({
        templateId: t.templateId,
        sent: t._sum.sentCount ?? 0,
        delivered: t._sum.deliveredCount ?? 0,
        failed: t._sum.failedCount ?? 0,
        deliveryRate: pct(t._sum.deliveredCount ?? 0, t._sum.sentCount ?? 0),
      })),
      providerPerformance: providerPerf.map((p) => ({
        providerId: p.providerId,
        sent: p._sum.sentCount ?? 0,
        delivered: p._sum.deliveredCount ?? 0,
        failed: p._sum.failedCount ?? 0,
        deliveryRate: pct(p._sum.deliveredCount ?? 0, p._sum.sentCount ?? 0),
      })),
    };
  },
};
