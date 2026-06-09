import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { applyLeadScope } from '../../../shared/utils/data-scope.js';
import { SANCTIONED_PLUS_STATUSES } from '../../applications/constants/applications.constants.js';
import { CONVERTED_STATUSES } from '../../leads/constants/leads.constants.js';
import { METRIC_CODES } from '../constants/analytics.constants.js';
import { analyticsRepository } from '../repositories/analytics.repository.js';
import type { KpiCard } from '../types/analytics.types.js';
import { scopedQuery } from '../utils/analytics-date.utils.js';
import { applyAnalyticsScope } from '../utils/analytics-scope.utils.js';

function leadWhere(actor: AuthenticatedUser, query: AnalyticsBaseQuery & { fromDate: Date; toDate: Date }) {
  return applyLeadScope(actor, {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.employeeId ? { assignedToId: query.employeeId } : {}),
    createdAt: { gte: query.fromDate, lte: query.toDate },
  });
}

function applicationWhere(actor: AuthenticatedUser, query: AnalyticsBaseQuery & { fromDate: Date; toDate: Date }) {
  const base = {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    createdAt: { gte: query.fromDate, lte: query.toDate },
  };
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) return base;
  if (query.employeeId) return { ...base, assignedSalesId: query.employeeId };
  return base;
}

export const metricEngineService = {
  async computeKpis(actor: AuthenticatedUser, rawQuery: AnalyticsBaseQuery): Promise<KpiCard[]> {
    const query = scopedQuery(applyAnalyticsScope(actor, rawQuery));
    const lw = leadWhere(actor, query);
    const aw = applicationWhere(actor, query);

    const [
      totalLeads,
      hotLeads,
      applications,
      sanctions,
      disbursements,
      customers,
      commissionPaidAgg,
      commissionPendingAgg,
      disbursementAmount,
      aiUsage,
      voiceUsage,
      notifications,
      openTickets,
      docsTotal,
      docsVerified,
    ] = await Promise.all([
      prisma.lead.count({ where: lw }),
      prisma.lead.count({ where: { ...lw, grade: { in: ['A_PLUS', 'A'] } } }),
      prisma.application.count({ where: aw }),
      prisma.application.count({ where: { ...aw, status: { in: [...SANCTIONED_PLUS_STATUSES] } } }),
      prisma.application.count({ where: { ...aw, status: 'DISBURSED' } }),
      prisma.customer.count({
        where: {
          deletedAt: null,
          createdAt: { gte: query.fromDate, lte: query.toDate },
          ...(query.branchId ? { branchId: query.branchId } : {}),
        },
      }),
      prisma.commissionLedger.aggregate({
        where: { deletedAt: null, status: 'PAID', createdAt: { gte: query.fromDate, lte: query.toDate } },
        _sum: { commissionAmount: true },
      }),
      prisma.commissionLedger.aggregate({
        where: { deletedAt: null, status: { in: ['CALCULATED', 'APPROVED'] }, createdAt: { gte: query.fromDate, lte: query.toDate } },
        _sum: { commissionAmount: true },
      }),
      prisma.disbursement.aggregate({
        where: { createdAt: { gte: query.fromDate, lte: query.toDate } },
        _sum: { disbursementAmount: true },
      }),
      prisma.aiUsageLog.count({ where: { createdAt: { gte: query.fromDate, lte: query.toDate } } }),
      prisma.aiUsageLog.count({
        where: { createdAt: { gte: query.fromDate, lte: query.toDate }, module: 'VOICE_AI' },
      }),
      prisma.notification.count({ where: { createdAt: { gte: query.fromDate, lte: query.toDate } } }),
      prisma.ticket.count({
        where: {
          deletedAt: null,
          status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_INTERNAL'] },
        },
      }),
      prisma.document.count({ where: { deletedAt: null, createdAt: { gte: query.fromDate, lte: query.toDate } } }),
      prisma.document.count({
        where: { deletedAt: null, status: 'VERIFIED', createdAt: { gte: query.fromDate, lte: query.toDate } },
      }),
    ]);

    const converted = await prisma.lead.count({ where: { ...lw, status: { in: [...CONVERTED_STATUSES] } } });
    const reviewed = applications;
    const approvalRate = reviewed > 0 ? Math.round((sanctions / reviewed) * 1000) / 10 : 0;
    const disbursalRate = sanctions > 0 ? Math.round((disbursements / sanctions) * 1000) / 10 : 0;
    const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 1000) / 10 : 0;
    const docCompletion = docsTotal > 0 ? Math.round((docsVerified / docsTotal) * 1000) / 10 : 0;
    const revenue = Number(disbursementAmount._sum.disbursementAmount ?? 0);
    const commissionPaid = Number(commissionPaidAgg._sum.commissionAmount ?? 0);
    const commissionPending = Number(commissionPendingAgg._sum.commissionAmount ?? 0);

    return [
      { code: METRIC_CODES.TOTAL_LEADS, name: 'Total Leads', value: totalLeads, unit: 'count' },
      { code: METRIC_CODES.HOT_LEADS, name: 'Hot Leads', value: hotLeads, unit: 'count' },
      { code: METRIC_CODES.APPLICATIONS, name: 'Applications', value: applications, unit: 'count' },
      { code: METRIC_CODES.SANCTIONS, name: 'Sanctions', value: sanctions, unit: 'count' },
      { code: METRIC_CODES.DISBURSEMENTS, name: 'Disbursements', value: disbursements, unit: 'count' },
      { code: METRIC_CODES.REVENUE, name: 'Revenue', value: revenue, unit: 'INR' },
      { code: METRIC_CODES.COMMISSION_PAID, name: 'Commission Paid', value: commissionPaid, unit: 'INR' },
      { code: METRIC_CODES.COMMISSION_PENDING, name: 'Commission Pending', value: commissionPending, unit: 'INR' },
      { code: METRIC_CODES.CUSTOMER_GROWTH, name: 'Customer Growth', value: customers, unit: 'count' },
      { code: METRIC_CODES.DOCUMENT_COMPLETION, name: 'Document Completion', value: docCompletion, unit: 'percent' },
      { code: METRIC_CODES.APPROVAL_RATE, name: 'Approval Rate', value: approvalRate, unit: 'percent' },
      { code: METRIC_CODES.DISBURSAL_RATE, name: 'Disbursal Rate', value: disbursalRate, unit: 'percent' },
      { code: METRIC_CODES.CONVERSION_RATE, name: 'Conversion Rate', value: conversionRate, unit: 'percent' },
      { code: METRIC_CODES.AI_USAGE, name: 'AI Usage', value: aiUsage, unit: 'count' },
      { code: METRIC_CODES.VOICE_AI_USAGE, name: 'Voice AI Usage', value: voiceUsage, unit: 'count' },
      { code: METRIC_CODES.NOTIFICATION_SENT, name: 'Notifications Sent', value: notifications, unit: 'count' },
      { code: METRIC_CODES.SUPPORT_OPEN, name: 'Open Tickets', value: openTickets, unit: 'count' },
    ];
  },

  async persistDailyMetrics(snapshotDate: Date): Promise<number> {
    const definitions = await analyticsRepository.listMetricDefinitions();
    if (!definitions.length) return 0;

    const kpis = await this.computeKpis(
      { id: 'system', roles: ['SUPER_ADMIN'], dataScope: 'ORGANIZATION' } as never,
      { timePreset: 'TODAY' },
    );
    const defMap = new Map(definitions.map((d) => [d.code, d.id]));
    let written = 0;

    for (const kpi of kpis) {
      const metricDefinitionId = defMap.get(kpi.code);
      if (!metricDefinitionId) continue;
      await analyticsRepository.upsertMetricValue({
        metricDefinitionId,
        snapshotDate,
        value: kpi.value,
      });
      written += 1;
    }
    return written;
  },
};
