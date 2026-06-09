import { prisma } from '../../../config/database.js';
import { ROLE_TO_EXECUTIVE } from '../constants/executive-analytics.constants.js';
import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import type { ExecutiveKpi, ExecutiveRoleType, ExecutiveScope, ResolvedExecutivePeriod } from '../types/executive-analytics.types.js';

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function num(v: unknown): number {
  if (v == null) return 0;
  return Number(v);
}

async function getTargets(employeeId: string, period: ResolvedExecutivePeriod): Promise<Map<string, number>> {
  const targets = await prisma.executiveTarget.findMany({
    where: {
      employeeId,
      periodType: period.periodType,
      periodStart: { lte: period.toDate },
      periodEnd: { gte: period.fromDate },
      isActive: true,
    },
  });
  return new Map(targets.map((t) => [t.metricCode, Number(t.targetValue)]));
}

function withTargets(kpis: ExecutiveKpi[], targets: Map<string, number>): ExecutiveKpi[] {
  return kpis.map((k) => {
    const target = targets.get(k.code);
    const achievementPct = target ? pct(k.value, target) : undefined;
    return { ...k, target, achievementPct };
  });
}

async function computeSalesKpis(employeeId: string, userId: string | undefined, period: ResolvedExecutivePeriod): Promise<ExecutiveKpi[]> {
  const dateFilter = { gte: period.fromDate, lte: period.toDate };
  const leadWhere = { assignedToId: employeeId, createdAt: dateFilter };

  const [
    leadsAssigned,
    leadsContacted,
    followupsCompleted,
    meetingsScheduled,
    applicationsCreated,
    applicationsSubmitted,
    conversions,
    revenueAgg,
    commissionAgg,
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.leadActivity.count({
      where: {
        performedById: userId ?? '',
        createdAt: dateFilter,
        lead: { assignedToId: employeeId },
      },
    }),
    prisma.leadFollowUp.count({
      where: { assignedToId: employeeId, status: 'COMPLETED', completedAt: dateFilter },
    }),
    prisma.leadFollowUp.count({
      where: { assignedToId: employeeId, followUpType: 'MEETING', scheduledAt: dateFilter },
    }),
    prisma.application.count({ where: { assignedSalesId: employeeId, createdAt: dateFilter } }),
    prisma.application.count({ where: { assignedSalesId: employeeId, submittedAt: dateFilter } }),
    prisma.lead.count({ where: { assignedToId: employeeId, convertedAt: dateFilter } }),
    prisma.disbursement.aggregate({
      where: { application: { assignedSalesId: employeeId }, disbursementDate: dateFilter },
      _sum: { disbursementAmount: true },
    }),
    prisma.commissionLedger.aggregate({
      where: {
        application: { assignedSalesId: employeeId },
        status: 'PAID',
        createdAt: dateFilter,
      },
      _sum: { commissionAmount: true },
    }),
  ]);

  const revenue = num(revenueAgg._sum.disbursementAmount);
  const commission = num(commissionAgg._sum.commissionAmount);
  const conversionRate = pct(conversions, leadsAssigned);

  const kpis: ExecutiveKpi[] = [
    { code: 'leads_assigned', name: 'Leads Assigned', value: leadsAssigned, unit: 'count' },
    { code: 'leads_contacted', name: 'Leads Contacted', value: leadsContacted, unit: 'count' },
    { code: 'followups_completed', name: 'Follow-Ups Completed', value: followupsCompleted, unit: 'count' },
    { code: 'meetings_scheduled', name: 'Meetings Scheduled', value: meetingsScheduled, unit: 'count' },
    { code: 'applications_created', name: 'Applications Created', value: applicationsCreated, unit: 'count' },
    { code: 'applications_submitted', name: 'Applications Submitted', value: applicationsSubmitted, unit: 'count' },
    { code: 'conversions', name: 'Conversions', value: conversions, unit: 'count' },
    { code: 'conversion_rate', name: 'Conversion Rate', value: conversionRate, unit: 'percent' },
    { code: 'revenue_generated', name: 'Revenue Generated', value: revenue, unit: 'INR' },
    { code: 'commission_earned', name: 'Commission Earned', value: commission, unit: 'INR' },
  ];

  const targets = await getTargets(employeeId, period);
  const enriched = withTargets(kpis, targets);
  const primaryTarget = targets.get('conversions') ?? targets.get('revenue_generated');
  const primaryValue = conversions || revenue;
  const achievement = primaryTarget ? pct(primaryValue, primaryTarget) : 0;
  enriched.push({ code: 'target_achievement_pct', name: 'Target Achievement %', value: achievement, unit: 'percent' });
  return enriched;
}

async function computeRmKpis(employeeId: string, period: ResolvedExecutivePeriod): Promise<ExecutiveKpi[]> {
  const dateFilter = { gte: period.fromDate, lte: period.toDate };

  const [portfolioSize, activeCustomers, renewals, crossSell, repeatBusiness, tickets] = await Promise.all([
    prisma.customer.count({ where: { rmEmployeeId: employeeId, deletedAt: null } }),
    prisma.customer.count({
      where: {
        rmEmployeeId: employeeId,
        applications: { some: { status: { in: ['SANCTIONED', 'DISBURSED'] } } },
      },
    }),
    prisma.closure.count({
      where: { rmAssignedId: employeeId, closureType: 'DISBURSED_COMPLETE', createdAt: dateFilter },
    }),
    prisma.application.aggregate({
      where: {
        customer: { rmEmployeeId: employeeId },
        createdAt: dateFilter,
      },
      _sum: { requestedAmount: true },
    }),
    prisma.application.count({
      where: { customer: { rmEmployeeId: employeeId }, createdAt: dateFilter, leadId: { not: null } },
    }),
    prisma.ticket.count({
      where: { assignedToId: employeeId, resolvedAt: dateFilter },
    }),
  ]);

  const retentionRate = pct(activeCustomers, portfolioSize || 1);
  const customerSatisfaction = tickets > 0 ? Math.min(100, 70 + tickets * 2) : 75;

  const kpis: ExecutiveKpi[] = [
    { code: 'portfolio_size', name: 'Portfolio Size', value: portfolioSize, unit: 'count' },
    { code: 'active_customers', name: 'Active Customers', value: activeCustomers, unit: 'count' },
    { code: 'renewals', name: 'Renewals', value: renewals, unit: 'count' },
    { code: 'cross_sell_revenue', name: 'Cross-Sell Revenue', value: num(crossSell._sum.requestedAmount), unit: 'INR' },
    { code: 'retention_rate', name: 'Retention Rate', value: retentionRate, unit: 'percent' },
    { code: 'customer_satisfaction', name: 'Customer Satisfaction', value: customerSatisfaction, unit: 'percent' },
    { code: 'repeat_business', name: 'Repeat Business', value: repeatBusiness, unit: 'count' },
  ];
  return withTargets(kpis, await getTargets(employeeId, period));
}

async function computeCreditKpis(employeeId: string, period: ResolvedExecutivePeriod): Promise<ExecutiveKpi[]> {
  const dateFilter = { gte: period.fromDate, lte: period.toDate };

  const [reviewed, eligibility, approved, rejected, riskCases, reviews] = await Promise.all([
    prisma.creditReview.count({ where: { reviewerId: employeeId, createdAt: dateFilter } }),
    prisma.eligibilityResult.count({
      where: { application: { assignedCreditId: employeeId }, checkedAt: dateFilter },
    }),
    prisma.creditReview.count({ where: { reviewerId: employeeId, decision: 'APPROVED', reviewedAt: dateFilter } }),
    prisma.creditReview.count({ where: { reviewerId: employeeId, decision: 'REJECTED', reviewedAt: dateFilter } }),
    prisma.creditReview.count({
      where: { reviewerId: employeeId, riskGrade: 'HIGH', createdAt: dateFilter },
    }),
    prisma.creditReview.findMany({
      where: { reviewerId: employeeId, reviewedAt: dateFilter },
      select: { createdAt: true, reviewedAt: true },
      take: 200,
    }),
  ]);

  const tatHours =
    reviews.length > 0
      ? reviews.reduce((sum, r) => {
          if (!r.reviewedAt) return sum;
          return sum + (r.reviewedAt.getTime() - r.createdAt.getTime()) / 3_600_000;
        }, 0) / reviews.length
      : 0;

  const approvalAccuracy = pct(approved, approved + rejected || 1);

  const kpis: ExecutiveKpi[] = [
    { code: 'applications_reviewed', name: 'Applications Reviewed', value: reviewed, unit: 'count' },
    { code: 'eligibility_checks', name: 'Eligibility Checks', value: eligibility, unit: 'count' },
    { code: 'approval_recommendations', name: 'Approval Recommendations', value: approved, unit: 'count' },
    { code: 'rejections', name: 'Rejections', value: rejected, unit: 'count' },
    { code: 'credit_tat', name: 'Credit TAT (hrs)', value: Math.round(tatHours * 10) / 10, unit: 'hours' },
    { code: 'risk_cases', name: 'Risk Cases', value: riskCases, unit: 'count' },
    { code: 'approval_accuracy', name: 'Approval Accuracy', value: approvalAccuracy, unit: 'percent' },
  ];
  return withTargets(kpis, await getTargets(employeeId, period));
}

async function computeOpsKpis(employeeId: string, userId: string | undefined, period: ResolvedExecutivePeriod): Promise<ExecutiveKpi[]> {
  const dateFilter = { gte: period.fromDate, lte: period.toDate };

  const [processed, bankLogins, docVerified, sanctions, disbursements, escalations, resolutions] = await Promise.all([
    prisma.application.count({ where: { assignedOpsId: employeeId, updatedAt: dateFilter } }),
    prisma.bankLogin.count({ where: { submittedById: employeeId, loginDate: dateFilter } }),
    prisma.document.count({ where: { verifiedById: userId ?? '', verifiedAt: dateFilter } }),
    prisma.sanction.count({ where: { createdById: userId ?? '', createdAt: dateFilter } }),
    prisma.disbursement.count({
      where: { application: { assignedOpsId: employeeId }, disbursementDate: dateFilter },
    }),
    prisma.ticketEscalation.count({
      where: { escalatedById: userId ?? '', escalatedAt: dateFilter },
    }),
    prisma.ticketResolution.findMany({
      where: { resolvedById: userId ?? '', resolvedAt: dateFilter },
      include: { ticket: { select: { createdAt: true } } },
      take: 100,
    }),
  ]);

  const resolutionHours =
    resolutions.length > 0
      ? resolutions.reduce((sum, r) => sum + (r.resolvedAt.getTime() - r.ticket.createdAt.getTime()) / 3_600_000, 0) /
        resolutions.length
      : 0;

  const kpis: ExecutiveKpi[] = [
    { code: 'applications_processed', name: 'Applications Processed', value: processed, unit: 'count' },
    { code: 'bank_logins', name: 'Bank Logins', value: bankLogins, unit: 'count' },
    { code: 'document_verification', name: 'Document Verification', value: docVerified, unit: 'count' },
    { code: 'sanctions', name: 'Sanctions', value: sanctions, unit: 'count' },
    { code: 'disbursements', name: 'Disbursements', value: disbursements, unit: 'count' },
    { code: 'operational_tat', name: 'Operational TAT (hrs)', value: Math.round(resolutionHours * 10) / 10, unit: 'hours' },
    { code: 'escalations', name: 'Escalations', value: escalations, unit: 'count' },
    { code: 'resolution_time', name: 'Resolution Time (hrs)', value: Math.round(resolutionHours * 10) / 10, unit: 'hours' },
  ];
  return withTargets(kpis, await getTargets(employeeId, period));
}

async function computeProductivity(employeeId: string, userId: string | undefined, period: ResolvedExecutivePeriod) {
  const dateFilter = { gte: period.fromDate, lte: period.toDate };
  const [activities, followups, pendingFollowups, pendingTickets] = await Promise.all([
    prisma.leadActivity.count({ where: { performedById: userId ?? '', createdAt: dateFilter } }),
    prisma.leadFollowUp.count({ where: { assignedToId: employeeId, completedAt: dateFilter } }),
    prisma.leadFollowUp.count({ where: { assignedToId: employeeId, status: 'PENDING' } }),
    prisma.ticket.count({ where: { assignedToId: employeeId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
  ]);

  const workingHours = Math.round((activities * 0.25 + followups * 0.5) * 10) / 10;
  const taskCompletion = pct(followups, followups + pendingFollowups || 1);

  return {
    daily_activity: activities,
    weekly_activity: activities,
    working_hours: workingHours,
    task_completion: taskCompletion,
    response_time: pendingTickets > 5 ? 4.5 : 2.0,
    pending_workload: pendingFollowups + pendingTickets,
  };
}

function detectRoleFromEmployee(department?: string | null, designation?: string | null): ExecutiveRoleType {
  if (department?.includes('Credit')) return 'CREDIT_EXECUTIVE';
  if (department?.includes('Ops')) return 'OPERATIONS_EXECUTIVE';
  if (designation?.includes('Relationship')) return 'RELATIONSHIP_MANAGER';
  return 'SALES_EXECUTIVE';
}

export const executiveMetricEngineService = {
  async computeKpis(
    employeeId: string,
    role: ExecutiveRoleType,
    period: ResolvedExecutivePeriod,
  ): Promise<ExecutiveKpi[]> {
    const employee = await executiveAnalyticsRepository.getEmployee(employeeId);
    if (!employee) return [];

    const effectiveRole = role || detectRoleFromEmployee(employee.department, employee.designation);

    switch (effectiveRole) {
      case 'RELATIONSHIP_MANAGER':
        return computeRmKpis(employeeId, period);
      case 'CREDIT_EXECUTIVE':
        return computeCreditKpis(employeeId, period);
      case 'OPERATIONS_EXECUTIVE':
        return computeOpsKpis(employeeId, employee.userId, period);
      case 'SALES_EXECUTIVE':
      default:
        return computeSalesKpis(employeeId, employee.userId, period);
    }
  },

  computeProductivity,

  detectRoleFromRoles(roles: string[]): ExecutiveRoleType | undefined {
    for (const r of roles) {
      const mapped = ROLE_TO_EXECUTIVE[r];
      if (mapped) return mapped;
    }
    return undefined;
  },

  async persistMetrics(
    employeeId: string,
    role: ExecutiveRoleType,
    period: ResolvedExecutivePeriod,
  ): Promise<number> {
    const kpis = await this.computeKpis(employeeId, role, period);
    const employee = await executiveAnalyticsRepository.getEmployee(employeeId);
    if (!employee) return 0;

    for (const kpi of kpis) {
      await executiveAnalyticsRepository.upsertMetric({
        employeeId,
        executiveRole: role,
        metricCode: kpi.code,
        metricName: kpi.name,
        periodType: period.periodType,
        periodStart: period.fromDate,
        periodEnd: period.toDate,
        value: kpi.value,
        targetValue: kpi.target,
        unit: kpi.unit,
        branchId: employee.branchId,
        regionId: employee.branch.regionId,
      });
    }
    return kpis.length;
  },

  async getTrendPoints(
    employeeId: string,
    metricCode: string,
    period: ResolvedExecutivePeriod,
  ): Promise<Array<{ date: string; value: number }>> {
    const metrics = await prisma.executiveMetric.findMany({
      where: {
        employeeId,
        metricCode,
        periodStart: { gte: new Date(period.fromDate.getTime() - 90 * 86_400_000), lte: period.toDate },
      },
      orderBy: { periodStart: 'asc' },
      take: 12,
    });
    if (metrics.length) {
      return metrics.map((m) => ({
        date: m.periodStart.toISOString().slice(0, 10),
        value: Number(m.value),
      }));
    }
    return [{ date: period.fromDate.toISOString().slice(0, 10), value: 0 }];
  },

  async resolvePrimaryEmployee(scope: ExecutiveScope): Promise<string | undefined> {
    if (scope.employeeIds.length === 1) return scope.employeeIds[0];
    return scope.employeeIds[0];
  },
};
