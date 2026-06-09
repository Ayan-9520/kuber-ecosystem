import type { RegionalAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { losAnalyticsService } from '../../applications/services/los-analytics.service.js';
import { commissionAnalyticsService } from '../../commissions/services/commission-analytics.service.js';
import { CONVERTED_STATUSES } from '../../leads/constants/leads.constants.js';
import { ticketAnalyticsService } from '../../support/services/ticket-analytics.service.js';
import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';
import type { RegionalKpi, RegionalScope, ResolvedRegionalPeriod } from '../types/regional-analytics.types.js';
import { branchFilter, regionWhere } from '../utils/regional-scope.utils.js';

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 10000) / 100;
}

function num(v: unknown): number {
  return v == null ? 0 : Number(v);
}

function domainQuery(scope: RegionalScope, period: ResolvedRegionalPeriod) {
  return {
    ...regionWhere(scope, period.branchId),
    fromDate: period.fromDate,
    toDate: period.toDate,
    ...(period.productId ? { productId: period.productId } : {}),
    ...(period.partnerId ? { partnerId: period.partnerId } : {}),
    ...(period.employeeId ? { assignedToId: period.employeeId, assignedSalesId: period.employeeId } : {}),
  };
}

async function getTargets(regionId: string, period: ResolvedRegionalPeriod): Promise<Map<string, number>> {
  const targets = await prisma.regionalTarget.findMany({
    where: {
      regionId,
      periodType: period.periodType,
      periodStart: { lte: period.toDate },
      periodEnd: { gte: period.fromDate },
      isActive: true,
    },
  });
  return new Map(targets.map((t) => [t.metricCode, Number(t.targetValue)]));
}

function withTargets(kpis: RegionalKpi[], targets: Map<string, number>): RegionalKpi[] {
  return kpis.map((k) => {
    const target = targets.get(k.code);
    return { ...k, target, achievementPct: target ? pct(k.value, target) : undefined };
  });
}

export const regionalMetricEngineService = {
  async computeOverviewKpis(scope: RegionalScope, period: ResolvedRegionalPeriod, regionId: string): Promise<RegionalKpi[]> {
    const bf = branchFilter(scope);
    const dateFilter = { gte: period.fromDate, lte: period.toDate };

    const [totalBranches, activeBranches, employees, partners, customers, totalLeads, totalApps, revenueAgg, prevLeads] =
      await Promise.all([
        prisma.branch.count({ where: { regionId } }),
        prisma.branch.count({ where: { regionId, isActive: true } }),
        prisma.employee.count({ where: { branch: { regionId }, isActive: true, deletedAt: null } }),
        prisma.partner.count({
          where: { deletedAt: null, leads: { some: { ...bf, deletedAt: null } } },
        }),
        prisma.customer.count({ where: { branch: { regionId }, deletedAt: null } }),
        prisma.lead.count({ where: { ...bf, deletedAt: null, createdAt: dateFilter } }),
        prisma.application.count({ where: { ...bf, deletedAt: null, createdAt: dateFilter } }),
        prisma.disbursement.aggregate({
          where: { application: { ...bf }, disbursementDate: dateFilter },
          _sum: { disbursementAmount: true },
        }),
        prisma.lead.count({
          where: {
            ...bf,
            deletedAt: null,
            createdAt: {
              gte: new Date(period.fromDate.getTime() - (period.toDate.getTime() - period.fromDate.getTime())),
              lt: period.fromDate,
            },
          },
        }),
      ]);

    const revenue = num(revenueAgg._sum.disbursementAmount);
    const growthRate = prevLeads > 0 ? pct(totalLeads - prevLeads, prevLeads) : totalLeads > 0 ? 100 : 0;

    const kpis: RegionalKpi[] = [
      { code: 'total_branches', name: 'Total Branches', value: totalBranches, unit: 'count', category: 'OVERVIEW' },
      { code: 'active_branches', name: 'Active Branches', value: activeBranches, unit: 'count', category: 'OVERVIEW' },
      { code: 'total_employees', name: 'Total Employees', value: employees, unit: 'count', category: 'OVERVIEW' },
      { code: 'total_partners', name: 'Total Partners', value: partners, unit: 'count', category: 'OVERVIEW' },
      { code: 'total_customers', name: 'Total Customers', value: customers, unit: 'count', category: 'OVERVIEW' },
      { code: 'total_leads', name: 'Total Leads', value: totalLeads, unit: 'count', category: 'OVERVIEW' },
      { code: 'total_applications', name: 'Total Applications', value: totalApps, unit: 'count', category: 'OVERVIEW' },
      { code: 'total_revenue', name: 'Total Revenue', value: revenue, unit: 'INR', category: 'OVERVIEW' },
      { code: 'regional_growth_rate', name: 'Regional Growth Rate', value: growthRate, unit: 'percent', category: 'GROWTH' },
    ];
    return withTargets(kpis, await getTargets(regionId, period));
  },

  async computeLeadKpis(scope: RegionalScope, period: ResolvedRegionalPeriod, regionId: string): Promise<RegionalKpi[]> {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const leadWhere = { ...branchFilter(scope), deletedAt: null, createdAt: dateFilter };

    const [total, hot, warm, cold, converted] = await Promise.all([
      prisma.lead.count({ where: leadWhere }),
      prisma.lead.count({ where: { ...leadWhere, grade: { in: ['A_PLUS', 'A'] } } }),
      prisma.lead.count({ where: { ...leadWhere, grade: 'B' } }),
      prisma.lead.count({ where: { ...leadWhere, grade: 'C' } }),
      prisma.lead.count({ where: { ...leadWhere, status: { in: [...CONVERTED_STATUSES] } } }),
    ]);

    const kpis: RegionalKpi[] = [
      { code: 'regional_leads', name: 'Regional Leads', value: total, unit: 'count', category: 'LEAD' },
      { code: 'hot_leads', name: 'Hot Leads', value: hot, unit: 'count', category: 'LEAD' },
      { code: 'warm_leads', name: 'Warm Leads', value: warm, unit: 'count', category: 'LEAD' },
      { code: 'cold_leads', name: 'Cold Leads', value: cold, unit: 'count', category: 'LEAD' },
      { code: 'conversion_rate', name: 'Lead Conversion Rate', value: pct(converted, total), unit: 'percent', category: 'LEAD' },
      { code: 'lead_quality_score', name: 'Lead Quality Score', value: total > 0 ? pct(hot, total) : 0, unit: 'percent', category: 'LEAD' },
    ];
    return withTargets(kpis, await getTargets(regionId, period));
  },

  async computeApplicationKpis(scope: RegionalScope, period: ResolvedRegionalPeriod, regionId: string): Promise<RegionalKpi[]> {
    const summary = await losAnalyticsService.getSummary(domainQuery(scope, period) as never);
    const kpis: RegionalKpi[] = [
      { code: 'applications_created', name: 'Applications Created', value: summary.totalApplications, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_submitted', name: 'Applications Submitted', value: summary.submitted, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_approved', name: 'Applications Approved', value: summary.sanctioned, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_rejected', name: 'Applications Rejected', value: summary.rejected, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_sanctioned', name: 'Applications Sanctioned', value: summary.sanctioned, unit: 'count', category: 'APPLICATION' },
      { code: 'applications_disbursed', name: 'Applications Disbursed', value: summary.disbursed, unit: 'count', category: 'APPLICATION' },
      { code: 'approval_rate', name: 'Approval Rate', value: summary.approvalRate, unit: 'percent', category: 'APPLICATION' },
      { code: 'disbursement_rate', name: 'Disbursement Rate', value: summary.disbursementRate, unit: 'percent', category: 'APPLICATION' },
      { code: 'regional_tat', name: 'Regional TAT (days)', value: summary.avgTatDays ?? 0, unit: 'days', category: 'APPLICATION' },
    ];
    return withTargets(kpis, await getTargets(regionId, period));
  },

  async computeRevenueKpis(scope: RegionalScope, period: ResolvedRegionalPeriod, regionId: string): Promise<RegionalKpi[]> {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const revenueAgg = await prisma.disbursement.aggregate({
      where: { application: { ...branchFilter(scope) }, disbursementDate: dateFilter },
      _sum: { disbursementAmount: true },
    });
    const revenue = num(revenueAgg._sum.disbursementAmount);
    const targets = await getTargets(regionId, period);
    const revenueTarget = targets.get('revenue_generated') ?? targets.get('total_revenue') ?? 0;
    return withTargets(
      [
        { code: 'revenue_generated', name: 'Regional Revenue', value: revenue, unit: 'INR', category: 'REVENUE' },
        { code: 'revenue_target', name: 'Revenue Target', value: revenueTarget, unit: 'INR', category: 'REVENUE' },
        { code: 'revenue_achievement_pct', name: 'Revenue Achievement %', value: pct(revenue, revenueTarget || 1), unit: 'percent', category: 'REVENUE' },
      ],
      targets,
    );
  },

  async computeCommissionKpis(scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const summary = await commissionAnalyticsService.getSummary({
      ...domainQuery(scope, period),
      groupBy: undefined,
    } as never);
    return [
      { code: 'commission_generated', name: 'Commission Generated', value: num(summary.totals?.totalCommission), unit: 'INR', category: 'COMMISSION' as const },
      { code: 'commission_paid', name: 'Commission Paid', value: num(summary.paidCommissions), unit: 'INR', category: 'COMMISSION' as const },
      { code: 'commission_pending', name: 'Commission Pending', value: num(summary.commissionOutstanding), unit: 'INR', category: 'COMMISSION' as const },
      { code: 'commission_recovery', name: 'Commission Recovery', value: num(summary.recoverySummary?.totalRecovered), unit: 'INR', category: 'COMMISSION' as const },
    ];
  },

  async computeSupportKpis(actor: { id: string; roles: string[] }, scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const summary = await ticketAnalyticsService.getSummary(actor as never, domainQuery(scope, period) as never);
    const totalTickets = summary.openTickets + summary.resolvedTickets + summary.closedTickets;
    const escalations = await prisma.ticketEscalation.count({
      where: {
        ticket: { ...branchFilter(scope) },
        escalatedAt: { gte: period.fromDate, lte: period.toDate },
      },
    });
    const slaCompliance = totalTickets > 0 ? pct(totalTickets - summary.slaBreaches, totalTickets) : 100;
    return [
      { code: 'tickets_created', name: 'Tickets Created', value: totalTickets, unit: 'count', category: 'SUPPORT' as const },
      { code: 'tickets_resolved', name: 'Tickets Resolved', value: summary.resolvedTickets + summary.closedTickets, unit: 'count', category: 'SUPPORT' as const },
      { code: 'escalations', name: 'Escalations', value: escalations, unit: 'count', category: 'SUPPORT' as const },
      { code: 'avg_resolution_time', name: 'Avg Resolution Time (hrs)', value: summary.avgResolutionHours, unit: 'hours', category: 'SUPPORT' as const },
      { code: 'sla_compliance', name: 'SLA Compliance', value: slaCompliance, unit: 'percent', category: 'SUPPORT' as const },
    ];
  },

  async computeProductMix(scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const byProduct = await prisma.application.groupBy({
      by: ['productId'],
      where: { ...branchFilter(scope), deletedAt: null, createdAt: dateFilter },
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

  async computePartnerPerformance(scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const byPartner = await prisma.lead.groupBy({
      by: ['partnerId'],
      where: { ...branchFilter(scope), deletedAt: null, partnerId: { not: null }, createdAt: dateFilter },
      _count: true,
    });
    const partnerIds = byPartner.map((p) => p.partnerId).filter(Boolean) as string[];
    const partners = partnerIds.length
      ? await prisma.partner.findMany({ where: { id: { in: partnerIds } }, include: { partnerType: true } })
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

  async computeBranchLeadContribution(scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const byBranch = await prisma.lead.groupBy({
      by: ['branchId'],
      where: { ...branchFilter(scope), deletedAt: null, createdAt: dateFilter },
      _count: true,
    });
    const branchIds = byBranch.map((b) => b.branchId).filter((id): id is string => id != null);
    const branches = branchIds.length ? await prisma.branch.findMany({ where: { id: { in: branchIds } } }) : [];
    const branchMap = new Map(branches.map((b) => [b.id, b]));
    return byBranch
      .filter((row) => row.branchId != null)
      .map((row) => ({
      branchId: row.branchId!,
      branchName: branchMap.get(row.branchId!)?.name ?? 'Unknown',
      leads: row._count,
    }));
  },

  async computeExecutiveSummary(scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const employees = await prisma.employee.findMany({
      where: {
        ...(scope.branchIds.length ? { branchId: { in: scope.branchIds } } : { branch: { regionId: scope.regionId } }),
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, firstName: true, lastName: true, branchId: true },
      take: 50,
    });
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
    return { topPerformers: scored.slice(0, 10), lowPerformers: scored.slice(-5).reverse() };
  },

  async computeBranchComparison(scope: RegionalScope, period: ResolvedRegionalPeriod) {
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const branches = await prisma.branch.findMany({
      where: { id: { in: scope.branchIds }, isActive: true },
      select: { id: true, name: true, code: true },
    });
    const compared = await Promise.all(
      branches.map(async (branch) => {
        const [leads, apps, revenueAgg, disbursed, converted] = await Promise.all([
          prisma.lead.count({ where: { branchId: branch.id, deletedAt: null, createdAt: dateFilter } }),
          prisma.application.count({ where: { branchId: branch.id, deletedAt: null, createdAt: dateFilter } }),
          prisma.disbursement.aggregate({
            where: { application: { branchId: branch.id }, disbursementDate: dateFilter },
            _sum: { disbursementAmount: true },
          }),
          prisma.application.count({ where: { branchId: branch.id, status: 'DISBURSED', updatedAt: dateFilter } }),
          prisma.lead.count({ where: { branchId: branch.id, status: { in: [...CONVERTED_STATUSES] }, createdAt: dateFilter } }),
        ]);
        const revenue = num(revenueAgg._sum.disbursementAmount);
        const conversionRate = pct(converted, leads);
        const complianceScore = 75;
        return {
          branch,
          leads,
          apps,
          revenue,
          disbursed,
          conversionRate,
          complianceScore,
          overallScore: leads * 2 + apps * 3 + revenue / 100000 + conversionRate,
        };
      }),
    );
    const byRevenue = [...compared].sort((a, b) => b.revenue - a.revenue);
    const byLeads = [...compared].sort((a, b) => b.leads - a.leads);
    const byConversion = [...compared].sort((a, b) => b.conversionRate - a.conversionRate);
    const byDisbursement = [...compared].sort((a, b) => b.disbursed - a.disbursed);
    const byCompliance = [...compared].sort((a, b) => b.complianceScore - a.complianceScore);
    const byOverall = [...compared].sort((a, b) => b.overallScore - a.overallScore);
    return {
      branches: compared,
      topBranches: byOverall.slice(0, 5),
      bottomBranches: byOverall.slice(-3).reverse(),
      revenueRanking: byRevenue,
      leadRanking: byLeads,
      conversionRanking: byConversion,
      disbursementRanking: byDisbursement,
      complianceRanking: byCompliance,
    };
  },

  async persistMetrics(regionId: string, period: ResolvedRegionalPeriod, kpis: RegionalKpi[]) {
    for (const kpi of kpis) {
      await regionalAnalyticsRepository.upsertMetric({
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

  resolvePrimaryRegion(scope: RegionalScope, query: RegionalAnalyticsBaseQuery): string | undefined {
    return query.regionId ?? scope.regionId;
  },
};
