import type { BranchAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { losAnalyticsService } from '../../applications/services/los-analytics.service.js';
import { commissionAnalyticsService } from '../../commissions/services/commission-analytics.service.js';
import { leadAnalyticsService } from '../../leads/services/lead-analytics.service.js';
import { ticketAnalyticsService } from '../../support/services/ticket-analytics.service.js';
import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';
import type { BranchKpi, BranchScope, ResolvedBranchPeriod } from '../types/branch-analytics.types.js';
import { branchWhere } from '../utils/branch-scope.utils.js';

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 10000) / 100;
}

function num(v: unknown): number {
  return v == null ? 0 : Number(v);
}

function domainQuery(scope: BranchScope, period: ResolvedBranchPeriod, branchId?: string) {
  const bw = branchWhere(scope, branchId);
  return {
    ...bw,
    fromDate: period.fromDate,
    toDate: period.toDate,
    ...(period.productId ? { productId: period.productId } : {}),
    ...(period.partnerId ? { partnerId: period.partnerId } : {}),
    ...(period.employeeId ? { assignedToId: period.employeeId, assignedSalesId: period.employeeId } : {}),
  };
}

async function getTargets(branchId: string, period: ResolvedBranchPeriod): Promise<Map<string, number>> {
  const targets = await prisma.branchTarget.findMany({
    where: {
      branchId,
      periodType: period.periodType,
      periodStart: { lte: period.toDate },
      periodEnd: { gte: period.fromDate },
      isActive: true,
    },
  });
  return new Map(targets.map((t) => [t.metricCode, Number(t.targetValue)]));
}

function withTargets(kpis: BranchKpi[], targets: Map<string, number>): BranchKpi[] {
  return kpis.map((k) => {
    const target = targets.get(k.code);
    return { ...k, target, achievementPct: target ? pct(k.value, target) : undefined };
  });
}

export const branchMetricEngineService = {
  async computeLeadKpis(scope: BranchScope, period: ResolvedBranchPeriod, branchId: string): Promise<BranchKpi[]> {
    const q = domainQuery(scope, period, branchId);
    const summary = await leadAnalyticsService.getSummary(q as never);
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const leadWhere = { ...branchWhere(scope, branchId), deletedAt: null, createdAt: dateFilter };

    const [assigned, warm, cold, rejected] = await Promise.all([
      prisma.lead.count({ where: { ...leadWhere, assignedToId: { not: null } } }),
      prisma.lead.count({ where: { ...leadWhere, grade: 'B' } }),
      prisma.lead.count({ where: { ...leadWhere, grade: 'C' } }),
      prisma.lead.count({ where: { ...leadWhere, status: 'LOST' } }),
    ]);

    const total = await prisma.lead.count({ where: leadWhere });
    const converted = summary.convertedLeads ?? 0;

    const kpis: BranchKpi[] = [
      { code: 'total_leads', name: 'Total Leads', value: total, unit: 'count', category: 'LEAD' },
      { code: 'new_leads', name: 'New Leads', value: summary.todayLeads ?? 0, unit: 'count', category: 'LEAD' },
      { code: 'assigned_leads', name: 'Assigned Leads', value: assigned, unit: 'count', category: 'LEAD' },
      { code: 'hot_leads', name: 'Hot Leads', value: summary.hotLeads ?? 0, unit: 'count', category: 'LEAD' },
      { code: 'warm_leads', name: 'Warm Leads', value: warm, unit: 'count', category: 'LEAD' },
      { code: 'cold_leads', name: 'Cold Leads', value: cold, unit: 'count', category: 'LEAD' },
      { code: 'rejected_leads', name: 'Rejected Leads', value: rejected, unit: 'count', category: 'LEAD' },
      { code: 'conversion_rate', name: 'Conversion Rate', value: pct(converted, total), unit: 'percent', category: 'LEAD' },
    ];
    return withTargets(kpis, await getTargets(branchId, period));
  },

  async computeApplicationKpis(scope: BranchScope, period: ResolvedBranchPeriod, branchId: string): Promise<BranchKpi[]> {
    const summary = await losAnalyticsService.getSummary(domainQuery(scope, period, branchId) as never);
    const kpis: BranchKpi[] = [
      { code: 'applications_created', name: 'Applications Created', value: summary.totalApplications, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_submitted', name: 'Applications Submitted', value: summary.submitted, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_approved', name: 'Applications Approved', value: summary.sanctioned, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_rejected', name: 'Applications Rejected', value: summary.rejected, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_sanctioned', name: 'Applications Sanctioned', value: summary.sanctioned, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_disbursed', name: 'Applications Disbursed', value: summary.disbursed, unit: 'count', category: 'APPLICATION' },
      { code: 'approval_rate', name: 'Approval Rate', value: summary.approvalRate, unit: 'percent', category: 'APPLICATION' },
      { code: 'disbursal_rate', name: 'Disbursal Rate', value: summary.disbursementRate, unit: 'percent', category: 'APPLICATION' },
      { code: 'application_tat', name: 'Application TAT (days)', value: summary.avgTatDays ?? 0, unit: 'days', category: 'APPLICATION' },
    ];
    return withTargets(kpis, await getTargets(branchId, period));
  },

  async computeRevenueKpis(_scope: BranchScope, period: ResolvedBranchPeriod, branchId: string): Promise<BranchKpi[]> {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const revenueAgg = await prisma.disbursement.aggregate({
      where: { application: { branchId }, disbursementDate: dateFilter },
      _sum: { disbursementAmount: true },
    });
    const revenue = num(revenueAgg._sum.disbursementAmount);
    const targets = await getTargets(branchId, period);
    const revenueTarget = targets.get('revenue_generated') ?? 0;
    const kpis: BranchKpi[] = [
      { code: 'revenue_generated', name: 'Revenue Generated', value: revenue, unit: 'INR', category: 'REVENUE' },
      { code: 'revenue_target', name: 'Revenue Target', value: revenueTarget, unit: 'INR', category: 'REVENUE' },
      { code: 'revenue_achievement_pct', name: 'Revenue Achievement %', value: pct(revenue, revenueTarget || 1), unit: 'percent', category: 'REVENUE' },
    ];
    return withTargets(kpis, targets);
  },

  async computeCommissionKpis(scope: BranchScope, period: ResolvedBranchPeriod, branchId: string) {
    const summary = await commissionAnalyticsService.getSummary({
      ...domainQuery(scope, period, branchId),
      groupBy: undefined,
    } as never);
    return [
      { code: 'commission_generated', name: 'Commission Generated', value: num(summary.totals?.totalCommission), unit: 'INR', category: 'COMMISSION' as const },
      { code: 'commission_paid', name: 'Commission Paid', value: num(summary.paidCommissions), unit: 'INR', category: 'COMMISSION' as const },
      { code: 'commission_pending', name: 'Commission Pending', value: num(summary.commissionOutstanding), unit: 'INR', category: 'COMMISSION' as const },
      { code: 'commission_recovery', name: 'Commission Recovery', value: num(summary.recoverySummary?.totalRecovered), unit: 'INR', category: 'COMMISSION' as const },
    ];
  },

  async computeSupportKpis(actor: { id: string; roles: string[] }, scope: BranchScope, period: ResolvedBranchPeriod, branchId: string) {
    const summary = await ticketAnalyticsService.getSummary(actor as never, domainQuery(scope, period, branchId) as never);
    const totalTickets = summary.openTickets + summary.resolvedTickets + summary.closedTickets;
    const escalations = await prisma.ticketEscalation.count({
      where: { ticket: { branchId }, escalatedAt: { gte: period.fromDate, lte: period.toDate } },
    });
    const slaCompliance = totalTickets > 0 ? pct(totalTickets - summary.slaBreaches, totalTickets) : 100;
    return [
      { code: 'tickets_created', name: 'Tickets Created', value: totalTickets, unit: 'count', category: 'SUPPORT' as const },
      { code: 'tickets_resolved', name: 'Tickets Resolved', value: summary.resolvedTickets + summary.closedTickets, unit: 'count', category: 'SUPPORT' as const },
      { code: 'avg_resolution_time', name: 'Avg Resolution Time (hrs)', value: summary.avgResolutionHours, unit: 'hours', category: 'SUPPORT' as const },
      { code: 'escalations', name: 'Escalations', value: escalations, unit: 'count', category: 'SUPPORT' as const },
      { code: 'sla_compliance', name: 'SLA Compliance', value: slaCompliance, unit: 'percent', category: 'SUPPORT' as const },
    ];
  },

  async computeProductMix(_scope: BranchScope, period: ResolvedBranchPeriod, branchId: string) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const byProduct = await prisma.application.groupBy({
      by: ['productId'],
      where: { branchId, deletedAt: null, createdAt: dateFilter },
      _count: true,
    });
    const productIds = byProduct.map((p) => p.productId);
    const products = productIds.length
      ? await prisma.product.findMany({ where: { id: { in: productIds } }, include: { family: true } })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    return byProduct.map((row) => {
      const product = productMap.get(row.productId);
      return {
        productId: row.productId,
        productName: product?.name ?? 'Unknown',
        familyCode: product?.family?.code ?? '',
        count: row._count,
      };
    });
  },

  async computePartnerPerformance(_scope: BranchScope, period: ResolvedBranchPeriod, branchId: string) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const byPartner = await prisma.lead.groupBy({
      by: ['partnerId'],
      where: { branchId, deletedAt: null, partnerId: { not: null }, createdAt: dateFilter },
      _count: true,
    });
    const partnerIds = byPartner.map((p) => p.partnerId).filter(Boolean) as string[];
    const partners = partnerIds.length
      ? await prisma.partner.findMany({
          where: { id: { in: partnerIds } },
          include: { partnerType: true },
        })
      : [];
    const partnerMap = new Map(partners.map((p) => [p.id, p]));

    return byPartner.map((row) => {
      const partner = partnerMap.get(row.partnerId!);
      return {
        partnerId: row.partnerId,
        partnerName: partner?.businessName ?? partner?.contactName ?? 'Unknown',
        partnerType: partner?.partnerType?.name ?? '',
        leads: row._count,
      };
    });
  },

  async computeExecutiveSummary(_scope: BranchScope, period: ResolvedBranchPeriod, branchId: string) {
    const employees = await prisma.employee.findMany({
      where: { branchId, isActive: true, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
      take: 20,
    });
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const scored = await Promise.all(
      employees.map(async (emp) => {
        const [leads, revenueAgg, apps] = await Promise.all([
          prisma.lead.count({ where: { assignedToId: emp.id, createdAt: dateFilter } }),
          prisma.disbursement.aggregate({
            where: { application: { assignedSalesId: emp.id }, disbursementDate: dateFilter },
            _sum: { disbursementAmount: true },
          }),
          prisma.application.count({ where: { assignedSalesId: emp.id, submittedAt: dateFilter } }),
        ]);
        const revenue = num(revenueAgg._sum.disbursementAmount);
        const score = leads * 2 + apps * 5 + revenue / 100000;
        return { employee: emp, leads, apps, revenue, score, conversionRate: pct(apps, leads || 1) };
      }),
    );
    scored.sort((a, b) => b.score - a.score);
    return {
      topPerformers: scored.slice(0, 5),
      bottomPerformers: scored.slice(-3).reverse(),
    };
  },

  async persistMetrics(branchId: string, regionId: string, period: ResolvedBranchPeriod, kpis: BranchKpi[]) {
    for (const kpi of kpis) {
      await branchAnalyticsRepository.upsertMetric({
        branchId,
        regionId,
        metricCode: kpi.code,
        metricName: kpi.name,
        category: kpi.category ?? 'GROWTH',
        periodType: period.periodType,
        periodStart: period.fromDate,
        periodEnd: period.toDate,
        value: kpi.value,
        targetValue: kpi.target,
        unit: kpi.unit,
      });
    }
    return kpis.length;
  },

  resolvePrimaryBranch(scope: BranchScope, query: BranchAnalyticsBaseQuery): string | undefined {
    return query.branchId ?? scope.branchIds[0];
  },
};
