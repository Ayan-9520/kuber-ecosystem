import { randomUUID } from 'node:crypto';

import type { AuthenticatedUser } from '@kuberone/shared-types';

import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import {
  APPROVAL_CHAIN_STEPS,
  CASE_JOURNEY,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  STAGE_LABELS,
} from '../constants/loan-fulfillment.constants.js';
import {
  cloneCase,
  getCaseById,
  getRevenueRuleById,
  isPartnerActor,
  listAllCases,
  listAllRevenueRules,
  nextCaseNumber,
  pushActivity,
  pushTimeline,
  saveCase,
  saveRevenueRule,
  toPartnerView,
} from '../repositories/loan-fulfillment.store.js';
import type {
  CreateDocumentInput,
  CreateLoanCaseInput,
  CreateRevenueRuleInput,
  CreateTaskInput,
  DashboardAnalytics,
  DecideApprovalInput,
  ListCasesQuery,
  ListRevenueRulesQuery,
  LoanCase,
  LoanCaseStage,
  LoanRevenueRule,
  PartnerLoanCaseView,
  RequestContext,
  RevenueDistribution,
  RevenueSlice,
  StakeholderInput,
  UpdateLoanCaseInput,
  UpdateRevenueRuleInput,
  UpdateTaskInput,
} from '../types/loan-fulfillment.types.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function actorName(user: AuthenticatedUser): string {
  return user.email ?? user.phone ?? user.id;
}

function partnerScopeId(user: AuthenticatedUser): string | undefined {
  if (!isPartnerActor(user)) return undefined;
  return user.partnerId;
}

function assertPartnerAccess(loanCase: LoanCase, user: AuthenticatedUser): void {
  const pid = partnerScopeId(user);
  if (pid && loanCase.partnerId !== pid) {
    throw new ForbiddenError('You do not have access to this loan case');
  }
}

/** Derived display name so lists never render a raw partner UUID. */
function partnerDisplayName(loanCase: LoanCase): string | null {
  const stakeholder = loanCase.stakeholders.find((s) => s.stakeholderType === 'PARTNER');
  return stakeholder?.stakeholderName ?? null;
}

function presentCase(loanCase: LoanCase, user: AuthenticatedUser): LoanCase | PartnerLoanCaseView {
  const pid = partnerScopeId(user);
  if (pid) return { ...toPartnerView(loanCase, pid), partnerName: partnerDisplayName(loanCase) };
  return { ...loanCase, partnerName: partnerDisplayName(loanCase) };
}

function stripPartnerWriteFields(input: UpdateLoanCaseInput | CreateLoanCaseInput): void {
  const mutable = input as UpdateLoanCaseInput;
  delete mutable.internalNotes;
  delete mutable.companyMargin;
  delete mutable.employeeIncentiveTotal;
  delete mutable.revenueGenerated;
}

function nextJourneyStage(current: LoanCaseStage): LoanCaseStage | null {
  const idx = CASE_JOURNEY.indexOf(current);
  if (idx < 0 || idx >= CASE_JOURNEY.length - 1) return null;
  return CASE_JOURNEY[idx + 1]!;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeDistribution(
  base: number,
  ruleOrStakeholders:
    | Pick<
        LoanRevenueRule,
        | 'gstPercent'
        | 'tdsPercent'
        | 'platformSharePercent'
        | 'partnerSharePercent'
        | 'employeeSharePercent'
        | 'teamSharePercent'
        | 'managerSharePercent'
        | 'companySharePercent'
      >
    | StakeholderInput[],
): RevenueDistribution {
  const isRule = !Array.isArray(ruleOrStakeholders);
  const gstPercent = isRule ? ruleOrStakeholders.gstPercent : 18;
  const tdsPercent = isRule ? ruleOrStakeholders.tdsPercent : 5;
  const gstAmount = round2((base * gstPercent) / 100);
  const tdsAmount = round2((base * tdsPercent) / 100);
  const netRevenue = round2(base + gstAmount - tdsAmount);

  const shares = isRule
    ? (
        [
          ['platform', ruleOrStakeholders.platformSharePercent],
          ['partner', ruleOrStakeholders.partnerSharePercent],
          ['employee', ruleOrStakeholders.employeeSharePercent],
          ['team', ruleOrStakeholders.teamSharePercent],
          ['manager', ruleOrStakeholders.managerSharePercent],
          ['company', ruleOrStakeholders.companySharePercent],
        ] as const
      )
        .filter(([, pct]) => pct > 0)
        .map(([key, percent]) => ({
          key,
          percent,
          amount: round2((netRevenue * percent) / 100),
        }))
    : ruleOrStakeholders.map((s) => ({
        key: s.stakeholderType.toLowerCase(),
        percent: s.sharePercent,
        amount: round2((netRevenue * s.sharePercent) / 100),
      }));

  return { baseRevenue: base, gstAmount, tdsAmount, netRevenue, shares };
}

/** Lender payout rules must distribute exactly 100% across configured stakeholders. */
function assertRuleSharesValid(rule: {
  platformSharePercent: number;
  partnerSharePercent: number;
  employeeSharePercent: number;
  teamSharePercent: number;
  managerSharePercent: number;
  companySharePercent: number;
}): void {
  const sum =
    rule.platformSharePercent +
    rule.partnerSharePercent +
    rule.employeeSharePercent +
    rule.teamSharePercent +
    rule.managerSharePercent +
    rule.companySharePercent;
  if (Math.abs(sum - 100) > 0.01) {
    throw new AppError(
      422,
      'VALIDATION_ERROR',
      `Revenue rule shares must sum to 100% (received ${round2(sum)}%)`,
    );
  }
}

function buildDefaultApprovals(loanCaseId: string): LoanCase['approvals'] {
  const ts = new Date().toISOString();
  return APPROVAL_CHAIN_STEPS.map((step) => ({
    id: randomUUID(),
    loanCaseId,
    step,
    status: 'NOT_REQUIRED' as const,
    comment: null,
    actedById: null,
    actedByName: null,
    actedAt: null,
    createdAt: ts,
  }));
}

function mapStakeholders(
  loanCaseId: string,
  rows: StakeholderInput[],
  baseAmount: number,
): LoanCase['stakeholders'] {
  const ts = new Date().toISOString();
  return rows.map((r) => ({
    id: randomUUID(),
    loanCaseId,
    stakeholderType: r.stakeholderType,
    stakeholderName: r.stakeholderName,
    stakeholderRefId: r.stakeholderRefId ?? null,
    sharePercent: r.sharePercent,
    amount: round2((baseAmount * r.sharePercent) / 100),
    approvalStatus: 'PENDING' as const,
    paymentStatus: 'NOT_DUE' as const,
    paidAt: null,
    transactionRef: null,
    createdAt: ts,
    updatedAt: ts,
  }));
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

const SANCTIONED_ONWARDS: LoanCaseStage[] = [
  'SANCTIONED',
  'DISBURSEMENT_SCHEDULED',
  'DISBURSED',
  'COMMISSION_GENERATED',
  'FINANCE_APPROVAL',
  'PARTNER_PAYMENT',
  'EMPLOYEE_INCENTIVE',
  'COMPLETED',
];

const DISBURSED_ONWARDS: LoanCaseStage[] = [
  'DISBURSED',
  'COMMISSION_GENERATED',
  'FINANCE_APPROVAL',
  'PARTNER_PAYMENT',
  'EMPLOYEE_INCENTIVE',
  'COMPLETED',
];

/** Counts cases whose timeline reached a stage on the given day. */
function countStageOnDay(cases: LoanCase[], stage: LoanCaseStage, day: string): number {
  return cases.filter((c) => c.timeline.some((t) => t.stage === stage && dayKey(t.createdAt) === day))
    .length;
}

function accumulate(
  bucket: Map<string, { amount: number; count: number }>,
  name: string | null | undefined,
  amount: number,
): void {
  if (!name) return;
  const cur = bucket.get(name) ?? { amount: 0, count: 0 };
  cur.amount += amount;
  cur.count += 1;
  bucket.set(name, cur);
}

function toSlices(bucket: Map<string, { amount: number; count: number }>): RevenueSlice[] {
  return Array.from(bucket.entries())
    .map(([name, v]) => ({ name, amount: round2(v.amount), count: v.count }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Partner dashboards must aggregate the partner's own commission, never company revenue.
 * `revenueOf` therefore switches between company revenue and partner share.
 */
function buildDashboard(cases: LoanCase[], partnerScoped: boolean): DashboardAnalytics {
  const activeStages = new Set<LoanCaseStage>(CASE_JOURNEY.filter((s) => s !== 'COMPLETED'));
  const today = dayKey(new Date().toISOString());

  const partnerShareOf = (c: LoanCase): number =>
    c.stakeholders
      .filter((s) => s.stakeholderType === 'PARTNER')
      .reduce((sum, s) => sum + s.amount, 0) || (c.expectedCommission ?? 0);

  const revenueOf = (c: LoanCase): number =>
    partnerScoped ? partnerShareOf(c) : (c.revenueGenerated ?? c.expectedRevenue ?? 0);

  const payoutRows = cases.flatMap((c) =>
    partnerScoped ? c.stakeholders.filter((s) => s.stakeholderType === 'PARTNER') : c.stakeholders,
  );

  const kpis = {
    totalCases: cases.length,
    activeCases: cases.filter(
      (c) => activeStages.has(c.stage) && c.stage !== 'REJECTED' && c.stage !== 'ON_HOLD',
    ).length,
    sanctionedCases: cases.filter((c) => SANCTIONED_ONWARDS.includes(c.stage)).length,
    disbursedCases: cases.filter((c) => DISBURSED_ONWARDS.includes(c.stage)).length,
    completedCases: cases.filter((c) => c.stage === 'COMPLETED').length,
    onHoldCases: cases.filter((c) => c.stage === 'ON_HOLD').length,
    rejectedCases: cases.filter((c) => c.stage === 'REJECTED').length,
    totalLoanAmount: cases.reduce((s, c) => s + c.loanAmount, 0),
    totalSanctionAmount: cases.reduce((s, c) => s + (c.sanctionAmount ?? 0), 0),
    totalDisbursementAmount: cases.reduce((s, c) => s + (c.disbursementAmount ?? 0), 0),
    totalExpectedRevenue: round2(cases.reduce((s, c) => s + (c.expectedRevenue ?? 0), 0)),
    totalExpectedCommission: round2(cases.reduce((s, c) => s + (c.expectedCommission ?? 0), 0)),
    totalRevenueGenerated: round2(cases.reduce((s, c) => s + (c.revenueGenerated ?? 0), 0)),
    pendingPayoutAmount: round2(
      payoutRows.filter((s) => s.paymentStatus !== 'PAID').reduce((sum, s) => sum + s.amount, 0),
    ),
    paidPayoutAmount: round2(
      payoutRows.filter((s) => s.paymentStatus === 'PAID').reduce((sum, s) => sum + s.amount, 0),
    ),
    pendingApprovals: cases.reduce(
      (s, c) => s + c.approvals.filter((a) => a.status === 'PENDING').length,
      0,
    ),
    pendingDocumentCases: cases.filter(
      (c) => c.stage === 'DOCUMENT_COLLECTION' || c.documents.some((d) => !d.verifiedAt),
    ).length,
    openTasks: cases.reduce(
      (s, c) => s + c.tasks.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
      0,
    ),
    overdueTasks: cases.reduce(
      (s, c) =>
        s +
        c.tasks.filter(
          (t) =>
            (t.status === 'OPEN' || t.status === 'IN_PROGRESS') &&
            Boolean(t.dueAt) &&
            new Date(t.dueAt as string).getTime() < Date.now(),
        ).length,
      0,
    ),
    todayLeads: cases.filter((c) => dayKey(c.createdAt) === today).length,
    todayLogins: countStageOnDay(cases, 'LOAN_LOGIN', today),
    todaySanctions: countStageOnDay(cases, 'SANCTIONED', today),
    todayDisbursements: countStageOnDay(cases, 'DISBURSED', today),
    avgCycleDays: (() => {
      const completed = cases.filter((c) => c.stage === 'COMPLETED' || c.disbursementAmount);
      if (!completed.length) return 0;
      const days = completed.map((c) => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.updatedAt).getTime();
        return Math.max(0, Math.round((end - start) / 86_400_000));
      });
      return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    })(),
  };

  const stageCounts = new Map<LoanCaseStage, { count: number; amount: number }>();
  for (const c of cases) {
    const cur = stageCounts.get(c.stage) ?? { count: 0, amount: 0 };
    cur.count += 1;
    cur.amount += c.loanAmount;
    stageCounts.set(c.stage, cur);
  }

  const bankBucket = new Map<string, { amount: number; count: number }>();
  const partnerBucket = new Map<string, { amount: number; count: number }>();
  const employeeBucket = new Map<string, { amount: number; count: number }>();
  for (const c of cases) {
    const revenue = revenueOf(c);
    accumulate(bankBucket, c.lenderName, revenue);
    const partnerName =
      c.stakeholders.find((s) => s.stakeholderType === 'PARTNER')?.stakeholderName ??
      (c.partnerId ? `Partner ${c.partnerId.slice(0, 8)}` : null);
    accumulate(partnerBucket, partnerName, partnerShareOf(c));
    if (!partnerScoped) {
      for (const s of c.stakeholders.filter((row) => row.stakeholderType === 'EMPLOYEE')) {
        accumulate(employeeBucket, s.stakeholderName, s.amount);
      }
    }
  }

  const productMap = new Map<string, { count: number; volume: number }>();
  for (const c of cases) {
    const cur = productMap.get(c.product) ?? { count: 0, volume: 0 };
    cur.count += 1;
    cur.volume += c.loanAmount;
    productMap.set(c.product, cur);
  }

  const monthMap = new Map<string, { cases: number; disbursement: number; revenue: number }>();
  for (const c of cases) {
    const key = monthKey(c.createdAt);
    const cur = monthMap.get(key) ?? { cases: 0, disbursement: 0, revenue: 0 };
    cur.cases += 1;
    cur.disbursement += c.disbursementAmount ?? 0;
    cur.revenue += revenueOf(c);
    monthMap.set(key, cur);
  }

  const funnel = APPROVAL_CHAIN_STEPS.map((step) => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const c of cases) {
      const a = c.approvals.find((x) => x.step === step);
      if (!a) continue;
      if (a.status === 'PENDING') pending += 1;
      else if (a.status === 'APPROVED') approved += 1;
      else if (a.status === 'REJECTED') rejected += 1;
    }
    return { step, pending, approved, rejected };
  });

  return {
    kpis,
    charts: {
      casesByStage: CASE_JOURNEY.filter((stage) => stageCounts.has(stage))
        .concat(
          (['REJECTED', 'ON_HOLD'] as LoanCaseStage[]).filter((stage) => stageCounts.has(stage)),
        )
        .map((stage) => ({
          stage,
          label: STAGE_LABELS[stage],
          count: stageCounts.get(stage)?.count ?? 0,
          amount: stageCounts.get(stage)?.amount ?? 0,
        })),
      casesByProduct: Array.from(productMap.entries()).map(([product, v]) => ({
        product: product as LoanCase['product'],
        count: v.count,
        volume: v.volume,
      })),
      monthlyVolume: Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, v]) => ({ month, ...v })),
      approvalFunnel: funnel,
      revenueByBank: toSlices(bankBucket),
      revenueByPartner: toSlices(partnerBucket),
      revenueByEmployee: toSlices(employeeBucket),
    },
  };
}

export const loanFulfillmentService = {
  dashboard(user: AuthenticatedUser): DashboardAnalytics {
    let cases = listAllCases();
    const pid = partnerScopeId(user);
    if (pid) cases = cases.filter((c) => c.partnerId === pid);
    const analytics = buildDashboard(cases, Boolean(pid));
    if (pid) {
      // Partners must not see company-level revenue aggregates beyond their commission view
      analytics.kpis.totalExpectedRevenue = analytics.kpis.totalExpectedCommission;
      analytics.kpis.totalRevenueGenerated = analytics.kpis.paidPayoutAmount;
    }
    return analytics;
  },

  listCases(user: AuthenticatedUser, query: ListCasesQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    const pid = partnerScopeId(user);

    let items = listAllCases();
    if (pid) {
      items = items.filter((c) => c.partnerId === pid);
    } else if (query.partnerId) {
      items = items.filter((c) => c.partnerId === query.partnerId);
    }
    if (query.stage) items = items.filter((c) => c.stage === query.stage);
    if (query.product) items = items.filter((c) => c.product === query.product);
    if (query.partner) {
      const q = query.partner.toLowerCase();
      items = items.filter(
        (c) =>
          (c.partnerId?.toLowerCase().includes(q) ?? false) ||
          c.stakeholders.some(
            (s) => s.stakeholderType === 'PARTNER' && s.stakeholderName.toLowerCase().includes(q),
          ),
      );
    }
    if (query.employee) {
      const q = query.employee.toLowerCase();
      items = items.filter(
        (c) =>
          (c.salesEmployeeId?.toLowerCase().includes(q) ?? false) ||
          (c.relationshipManagerId?.toLowerCase().includes(q) ?? false) ||
          c.stakeholders.some(
            (s) =>
              (s.stakeholderType === 'EMPLOYEE' ||
                s.stakeholderType === 'RELATIONSHIP_MANAGER' ||
                s.stakeholderType === 'TEAM_LEADER') &&
              s.stakeholderName.toLowerCase().includes(q),
          ),
      );
    }
    if (query.lenderName) {
      const q = query.lenderName.toLowerCase();
      items = items.filter((c) => c.lenderName.toLowerCase().includes(q));
    }
    if (query.city) {
      const q = query.city.toLowerCase();
      items = items.filter((c) => c.city?.toLowerCase().includes(q) ?? false);
    }
    if (query.state) {
      const q = query.state.toLowerCase();
      items = items.filter((c) => c.state?.toLowerCase().includes(q) ?? false);
    }
    if (typeof query.minAmount === 'number') {
      items = items.filter((c) => c.loanAmount >= (query.minAmount as number));
    }
    if (typeof query.maxAmount === 'number') {
      items = items.filter((c) => c.loanAmount <= (query.maxAmount as number));
    }
    if (query.fromDate) {
      const from = new Date(query.fromDate).getTime();
      items = items.filter((c) => new Date(c.createdAt).getTime() >= from);
    }
    if (query.toDate) {
      // Inclusive end-of-day so a single-day range returns that day's cases.
      const to = new Date(query.toDate).getTime() + 86_399_999;
      items = items.filter((c) => new Date(c.createdAt).getTime() <= to);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.lenderName.toLowerCase().includes(q) ||
          (c.pan?.toLowerCase().includes(q) ?? false),
      );
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortOrder;
      return String(av).localeCompare(String(bv)) * sortOrder;
    });

    const total = items.length;
    const slice = items.slice((page - 1) * limit, page * limit).map((c) => presentCase(c, user));
    return { items: slice, meta: buildPaginationMeta(page, limit, total) };
  },

  getCase(user: AuthenticatedUser, id: string) {
    const loanCase = getCaseById(id);
    if (!loanCase) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(loanCase, user);
    return presentCase(loanCase, user);
  },

  createCase(user: AuthenticatedUser, input: CreateLoanCaseInput, ctx: RequestContext) {
    const body = { ...input };
    if (isPartnerActor(user)) {
      stripPartnerWriteFields(body);
      body.partnerId = user.partnerId ?? body.partnerId;
      if (!body.partnerId) {
        throw new AppError(400, 'PARTNER_REQUIRED', 'Partner context is required to create a case');
      }
    }

    const id = randomUUID();
    const ts = new Date().toISOString();
    const baseRevenue = body.loanAmount * 0.0125;
    const stakeholders =
      body.stakeholders && body.stakeholders.length
        ? mapStakeholders(id, body.stakeholders, baseRevenue)
        : [];

    const loanCase: LoanCase = {
      id,
      caseNumber: nextCaseNumber(),
      stage: 'LEAD_CREATED',
      product: body.product,
      lenderName: body.lenderName,
      lenderId: body.lenderId ?? null,
      branchName: body.branchName ?? null,
      branchId: body.branchId ?? null,
      applicationId: body.applicationId ?? null,
      leadId: body.leadId ?? null,
      customerId: body.customerId ?? null,
      partnerId: body.partnerId ?? null,
      connectorId: body.connectorId ?? null,
      relationshipManagerId: body.relationshipManagerId ?? null,
      salesEmployeeId: body.salesEmployeeId ?? null,
      customerName: body.customerName,
      pan: body.pan ?? null,
      aadhaarMasked: body.aadhaarMasked ?? null,
      mobile: body.mobile,
      email: body.email ?? null,
      occupation: body.occupation ?? null,
      employer: body.employer ?? null,
      annualIncome: body.annualIncome ?? null,
      propertyAddress: body.propertyAddress ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      referralSource: body.referralSource ?? null,
      projectName: body.projectName ?? null,
      loanAmount: body.loanAmount,
      requestedAmount: body.requestedAmount,
      eligibleAmount: body.eligibleAmount ?? null,
      sanctionAmount: null,
      disbursementAmount: null,
      interestRate: body.interestRate ?? null,
      tenureMonths: body.tenureMonths ?? null,
      emiAmount: null,
      bankApplicationNumber: null,
      loanAccountNumber: null,
      expectedSanctionDate: null,
      expectedDisbursementDate: null,
      expectedRevenue: round2(baseRevenue),
      expectedCommission: stakeholders.find((s) => s.stakeholderType === 'PARTNER')?.amount ?? null,
      revenueGenerated: null,
      gstAmount: null,
      tdsAmount: null,
      netRevenue: null,
      companyMargin: null,
      employeeIncentiveTotal: null,
      approvalStatus: 'NOT_REQUIRED',
      paymentStatus: 'NOT_DUE',
      aiEligibilityScore: null,
      aiRiskScore: null,
      aiBankRecommendation: null,
      aiCaseSummary: null,
      remarks: body.remarks ?? null,
      internalNotes: isPartnerActor(user) ? null : (body.internalNotes ?? null),
      metadata: null,
      version: 1,
      createdAt: ts,
      updatedAt: ts,
      createdById: user.id,
      updatedById: user.id,
      deletedAt: null,
      deletedById: null,
      timeline: [],
      documents: [],
      stakeholders,
      approvals: buildDefaultApprovals(id),
      tasks: [],
      activities: [],
    };

    pushTimeline(loanCase, {
      stage: 'LEAD_CREATED',
      title: STAGE_LABELS.LEAD_CREATED,
      description: 'Case created',
      performedBy: actorName(user),
      performedById: user.id,
    });
    pushActivity(loanCase, 'CASE_CREATED', `Created ${loanCase.caseNumber}`, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  updateCase(user: AuthenticatedUser, id: string, input: UpdateLoanCaseInput, ctx: RequestContext) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const patch = { ...input };
    if (isPartnerActor(user)) {
      stripPartnerWriteFields(patch);
    }

    const loanCase = cloneCase(existing);
    const keys = Object.keys(patch) as Array<keyof UpdateLoanCaseInput>;
    for (const key of keys) {
      const value = patch[key];
      if (value !== undefined) {
        Object.assign(loanCase, { [key]: value });
      }
    }
    loanCase.version += 1;
    loanCase.updatedAt = new Date().toISOString();
    loanCase.updatedById = user.id;

    if (patch.stage && patch.stage !== existing.stage) {
      pushTimeline(loanCase, {
        stage: patch.stage,
        title: STAGE_LABELS[patch.stage],
        description: 'Stage updated',
        performedBy: actorName(user),
        performedById: user.id,
      });
    }

    pushActivity(loanCase, 'CASE_UPDATED', `Updated fields: ${keys.join(', ')}`, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  advanceStage(
    user: AuthenticatedUser,
    id: string,
    body: { stage?: LoanCaseStage; comment?: string },
    ctx: RequestContext,
  ) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const target: LoanCaseStage | null = body.stage ?? nextJourneyStage(existing.stage);
    if (!target) {
      throw new AppError(400, 'INVALID_STAGE', 'Case is already at a terminal journey stage');
    }
    const allowed =
      CASE_JOURNEY.includes(target) || target === 'REJECTED' || target === 'ON_HOLD';
    if (!allowed) {
      throw new AppError(400, 'INVALID_STAGE', `Unknown stage ${target}`);
    }

    const loanCase = cloneCase(existing);
    loanCase.stage = target;
    loanCase.version += 1;
    loanCase.updatedAt = new Date().toISOString();
    loanCase.updatedById = user.id;

    if (target === 'SANCTIONED' && !loanCase.sanctionAmount) {
      loanCase.sanctionAmount = loanCase.eligibleAmount ?? loanCase.loanAmount;
    }
    if (target === 'DISBURSED' && !loanCase.disbursementAmount) {
      loanCase.disbursementAmount = loanCase.sanctionAmount ?? loanCase.loanAmount;
    }
    if (target === 'COMMISSION_GENERATED' && loanCase.expectedRevenue) {
      const dist = computeDistribution(
        loanCase.expectedRevenue,
        loanCase.stakeholders.length
          ? loanCase.stakeholders.map((s) => ({
              stakeholderType: s.stakeholderType,
              stakeholderName: s.stakeholderName,
              stakeholderRefId: s.stakeholderRefId ?? undefined,
              sharePercent: s.sharePercent,
            }))
          : {
              gstPercent: 18,
              tdsPercent: 5,
              platformSharePercent: 0,
              partnerSharePercent: 40,
              employeeSharePercent: 15,
              teamSharePercent: 10,
              managerSharePercent: 5,
              companySharePercent: 30,
            },
      );
      loanCase.revenueGenerated = dist.baseRevenue;
      loanCase.gstAmount = dist.gstAmount;
      loanCase.tdsAmount = dist.tdsAmount;
      loanCase.netRevenue = dist.netRevenue;
    }

    pushTimeline(loanCase, {
      stage: target,
      title: STAGE_LABELS[target],
      description: body.comment ?? `Advanced to ${STAGE_LABELS[target]}`,
      performedBy: actorName(user),
      performedById: user.id,
    });
    pushActivity(loanCase, 'STAGE_ADVANCED', body.comment ?? `Stage → ${target}`, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  setStakeholders(
    user: AuthenticatedUser,
    id: string,
    stakeholders: StakeholderInput[],
    ctx: RequestContext,
  ) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const sum = stakeholders.reduce((s, r) => s + r.sharePercent, 0);
    if (Math.abs(sum - 100) > 0.01) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Stakeholder sharePercent must sum to 100');
    }

    const base = existing.expectedRevenue ?? existing.loanAmount * 0.0125;
    const loanCase = cloneCase(existing);
    loanCase.stakeholders = mapStakeholders(id, stakeholders, base);
    loanCase.expectedCommission =
      loanCase.stakeholders.find((s) => s.stakeholderType === 'PARTNER')?.amount ?? null;
    loanCase.version += 1;
    loanCase.updatedAt = new Date().toISOString();
    loanCase.updatedById = user.id;

    pushActivity(loanCase, 'STAKEHOLDERS_SET', `Set ${stakeholders.length} stakeholders`, {
      ...ctx,
      actorName: actorName(user),
    });
    pushTimeline(loanCase, {
      stage: loanCase.stage,
      title: 'Revenue stakeholders updated',
      description: 'Distribution shares recalculated',
      performedBy: actorName(user),
      performedById: user.id,
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  addDocument(user: AuthenticatedUser, id: string, input: CreateDocumentInput, ctx: RequestContext) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const loanCase = cloneCase(existing);
    const sameType = loanCase.documents.filter((d) => d.documentType === input.documentType);
    const doc = {
      id: randomUUID(),
      loanCaseId: id,
      documentType: input.documentType,
      fileName: input.fileName,
      storageKey: input.storageKey,
      mimeType: input.mimeType ?? null,
      fileSizeBytes: input.fileSizeBytes ?? null,
      version: sameType.length + 1,
      uploadedById: user.id,
      uploadedByName: actorName(user),
      verifiedAt: null,
      verifiedById: null,
      createdAt: new Date().toISOString(),
    };
    loanCase.documents.push(doc);
    loanCase.updatedAt = new Date().toISOString();
    loanCase.updatedById = user.id;
    loanCase.version += 1;

    pushActivity(loanCase, 'DOCUMENT_ADDED', `${input.documentType}: ${input.fileName}`, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  addTask(user: AuthenticatedUser, id: string, input: CreateTaskInput, ctx: RequestContext) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const loanCase = cloneCase(existing);
    const ts = new Date().toISOString();
    loanCase.tasks.push({
      id: randomUUID(),
      loanCaseId: id,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'MEDIUM',
      status: 'OPEN',
      dueAt: input.dueAt ?? null,
      assignedToId: input.assignedToId ?? null,
      assignedToName: input.assignedToName ?? null,
      completedAt: null,
      createdAt: ts,
      updatedAt: ts,
    });
    loanCase.updatedAt = ts;
    loanCase.updatedById = user.id;
    loanCase.version += 1;

    pushActivity(loanCase, 'TASK_ADDED', input.title, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  updateTask(
    user: AuthenticatedUser,
    id: string,
    taskId: string,
    input: UpdateTaskInput,
    ctx: RequestContext,
  ) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const loanCase = cloneCase(existing);
    const task = loanCase.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundError('LoanCaseTask', taskId);

    const ts = new Date().toISOString();
    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueAt !== undefined) task.dueAt = input.dueAt;
    if (input.assignedToId !== undefined) task.assignedToId = input.assignedToId;
    if (input.assignedToName !== undefined) task.assignedToName = input.assignedToName;
    if (input.status !== undefined) {
      task.status = input.status;
      task.completedAt = input.status === 'COMPLETED' ? ts : null;
    }
    task.updatedAt = ts;

    loanCase.updatedAt = ts;
    loanCase.updatedById = user.id;
    loanCase.version += 1;

    pushActivity(loanCase, 'TASK_UPDATED', `${task.title} → ${task.status}`, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  verifyDocument(user: AuthenticatedUser, id: string, documentId: string, ctx: RequestContext) {
    const existing = getCaseById(id);
    if (!existing) throw new NotFoundError('LoanCase', id);
    assertPartnerAccess(existing, user);

    const loanCase = cloneCase(existing);
    const doc = loanCase.documents.find((d) => d.id === documentId);
    if (!doc) throw new NotFoundError('LoanCaseDocument', documentId);
    if (doc.verifiedAt) throw new ValidationError('Document is already verified');

    const ts = new Date().toISOString();
    doc.verifiedAt = ts;
    doc.verifiedById = user.id;

    loanCase.updatedAt = ts;
    loanCase.updatedById = user.id;
    loanCase.version += 1;

    pushActivity(loanCase, 'DOCUMENT_VERIFIED', `${doc.documentType}: ${doc.fileName}`, {
      ...ctx,
      actorName: actorName(user),
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  decideApproval(
    user: AuthenticatedUser,
    caseId: string,
    approvalId: string,
    input: DecideApprovalInput,
    ctx: RequestContext,
  ) {
    const existing = getCaseById(caseId);
    if (!existing) throw new NotFoundError('LoanCase', caseId);
    assertPartnerAccess(existing, user);

    const loanCase = cloneCase(existing);
    const approval = loanCase.approvals.find((a) => a.id === approvalId);
    if (!approval) throw new NotFoundError('LoanCaseApproval', approvalId);

    approval.status = input.status;
    approval.comment = input.comment ?? null;
    approval.actedById = user.id;
    approval.actedByName = actorName(user);
    approval.actedAt = new Date().toISOString();

    if (input.status === 'REJECTED') {
      loanCase.approvalStatus = 'REJECTED';
      loanCase.stage = 'REJECTED';
    } else if (input.status === 'ON_HOLD') {
      loanCase.approvalStatus = 'ON_HOLD';
      loanCase.stage = 'ON_HOLD';
    } else if (input.status === 'APPROVED') {
      const idx = loanCase.approvals.findIndex((a) => a.id === approvalId);
      const next = idx >= 0 ? loanCase.approvals[idx + 1] : undefined;
      if (next && (next.status === 'NOT_REQUIRED' || next.status === 'PENDING')) {
        next.status = 'PENDING';
      }
      const chainDone = loanCase.approvals.every(
        (a) => a.status === 'APPROVED' || a.status === 'NOT_REQUIRED',
      );
      const anyPending = loanCase.approvals.some((a) => a.status === 'PENDING');
      loanCase.approvalStatus = chainDone ? 'APPROVED' : anyPending ? 'PENDING' : 'APPROVED';
    } else {
      loanCase.approvalStatus = 'PENDING';
    }

    loanCase.updatedAt = new Date().toISOString();
    loanCase.updatedById = user.id;
    loanCase.version += 1;

    pushActivity(
      loanCase,
      'APPROVAL_DECIDED',
      `${approval.step}: ${input.status}${input.comment ? ` — ${input.comment}` : ''}`,
      { ...ctx, actorName: actorName(user) },
    );
    pushTimeline(loanCase, {
      stage: loanCase.stage,
      title: `Approval ${input.status}`,
      description: `${approval.step} marked ${input.status}`,
      performedBy: actorName(user),
      performedById: user.id,
    });

    saveCase(loanCase);
    return presentCase(loanCase, user);
  },

  listRevenueRules(user: AuthenticatedUser, query: ListRevenueRulesQuery = {}) {
    if (isPartnerActor(user)) {
      throw new ForbiddenError('Partners cannot access revenue rule configuration');
    }

    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;

    let items = listAllRevenueRules();
    if (query.product) items = items.filter((r) => r.product === query.product);
    if (query.lenderName) {
      const q = query.lenderName.toLowerCase();
      items = items.filter((r) => r.lenderName.toLowerCase().includes(q));
    }
    if (typeof query.isActive === 'boolean') {
      items = items.filter((r) => r.isActive === query.isActive);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (r) => r.name.toLowerCase().includes(q) || r.lenderName.toLowerCase().includes(q),
      );
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = items.length;
    return {
      items: items.slice((page - 1) * limit, page * limit),
      meta: buildPaginationMeta(page, limit, total),
    };
  },

  getRevenueRule(user: AuthenticatedUser, id: string) {
    if (isPartnerActor(user)) {
      throw new ForbiddenError('Partners cannot access revenue rule configuration');
    }
    const rule = getRevenueRuleById(id);
    if (!rule) throw new NotFoundError('LoanRevenueRule', id);
    return rule;
  },

  createRevenueRule(user: AuthenticatedUser, input: CreateRevenueRuleInput, ctx: RequestContext) {
    if (isPartnerActor(user)) {
      throw new ForbiddenError('Partners cannot configure revenue rules');
    }
    const ts = new Date().toISOString();
    const rule: LoanRevenueRule = {
      id: randomUUID(),
      name: input.name,
      lenderName: input.lenderName,
      lenderId: input.lenderId ?? null,
      product: input.product,
      revenuePercent: input.revenuePercent,
      gstPercent: input.gstPercent ?? 18,
      tdsPercent: input.tdsPercent ?? 5,
      platformSharePercent: input.platformSharePercent ?? 0,
      partnerSharePercent: input.partnerSharePercent ?? 0,
      employeeSharePercent: input.employeeSharePercent ?? 0,
      teamSharePercent: input.teamSharePercent ?? 0,
      managerSharePercent: input.managerSharePercent ?? 0,
      companySharePercent: input.companySharePercent ?? 0,
      isActive: input.isActive ?? true,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
      createdAt: ts,
      updatedAt: ts,
      createdById: user.id,
    };
    assertRuleSharesValid(rule);
    saveRevenueRule(rule);
    void ctx;
    return rule;
  },

  updateRevenueRule(
    user: AuthenticatedUser,
    id: string,
    input: UpdateRevenueRuleInput,
    ctx: RequestContext,
  ) {
    if (isPartnerActor(user)) {
      throw new ForbiddenError('Partners cannot configure revenue rules');
    }
    const existing = getRevenueRuleById(id);
    if (!existing) throw new NotFoundError('LoanRevenueRule', id);

    const updated: LoanRevenueRule = {
      ...existing,
      ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
      updatedAt: new Date().toISOString(),
    };
    assertRuleSharesValid(updated);
    saveRevenueRule(updated);
    void ctx;
    return updated;
  },
};
