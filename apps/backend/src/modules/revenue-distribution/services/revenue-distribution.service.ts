import { randomUUID } from 'node:crypto';

import type { AuthenticatedUser } from '@kuberone/shared-types';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import {
  DEFAULT_GST_PERCENT,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_TDS_PERCENT,
  SHARE_SUM_TOLERANCE,
} from '../constants/revenue-distribution.constants.js';
import {
  cloneShares,
  getRuleById,
  getRunById,
  listAllAudit,
  listAllRules,
  listAllRuns,
  pushAudit,
  resolveMatchingRule,
  saveRule,
  saveRun,
} from '../repositories/revenue-distribution.store.js';
import type {
  CreateRuleInput,
  CreateRunInput,
  DistributionRule,
  DistributionRun,
  DistributionSummary,
  ListAuditQuery,
  ListRulesQuery,
  ListRunsQuery,
  RequestContext,
  SimulateInput,
  SimulationResult,
  StakeholderAllocation,
  StakeholderShare,
  UpdateRuleInput,
} from '../types/revenue-distribution.types.js';

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

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function stakeholderKey(s: Pick<StakeholderShare, 'stakeholderType' | 'label'>): string {
  return `${s.stakeholderType}::${s.label.trim().toLowerCase()}`;
}

/** Server-side money-math + share validation (single source of truth). */
export function assertStakeholdersValid(stakeholders: StakeholderShare[]): void {
  if (!stakeholders.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'At least one stakeholder is required');
  }

  const seen = new Set<string>();
  for (const s of stakeholders) {
    if (s.percentage < 0 || s.fixedAmount < 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Stakeholder percentages and amounts cannot be negative');
    }
    const key = stakeholderKey(s);
    if (seen.has(key)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Duplicate stakeholder rejected: ${s.stakeholderType} / ${s.label}`,
      );
    }
    seen.add(key);
  }

  const percentShares = stakeholders.filter((s) => s.mode === 'PERCENT');
  if (percentShares.length > 0) {
    const sum = percentShares.reduce((acc, s) => acc + s.percentage, 0);
    if (Math.abs(sum - 100) > SHARE_SUM_TOLERANCE) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Percentage shares must sum to exactly 100 (received ${round2(sum)})`,
      );
    }
  }
}

export function assertTaxRatesValid(gstPercent: number, tdsPercent: number): void {
  if (gstPercent < 0 || gstPercent > 100) {
    throw new AppError(400, 'VALIDATION_ERROR', 'GST rate must be between 0 and 100');
  }
  if (tdsPercent < 0 || tdsPercent > 100) {
    throw new AppError(400, 'VALIDATION_ERROR', 'TDS rate must be between 0 and 100');
  }
}

export function computeAllocations(
  grossRevenue: number,
  stakeholders: StakeholderShare[],
  gstPercent: number,
  tdsPercent: number,
): Pick<SimulationResult, 'gstAmount' | 'tdsAmount' | 'netRevenue' | 'allocations' | 'totalAllocated' | 'remainder' | 'isBalanced'> {
  if (grossRevenue < 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Gross revenue cannot be negative');
  }
  assertTaxRatesValid(gstPercent, tdsPercent);
  assertStakeholdersValid(stakeholders);

  const gstAmount = round2((grossRevenue * gstPercent) / 100);
  const tdsAmount = round2((grossRevenue * tdsPercent) / 100);
  const netRevenue = round2(grossRevenue + gstAmount - tdsAmount);

  const fixed = stakeholders.filter((s) => s.mode === 'FIXED');
  const percent = stakeholders.filter((s) => s.mode === 'PERCENT');
  const fixedTotal = round2(fixed.reduce((acc, s) => acc + s.fixedAmount, 0));
  const remaining = round2(Math.max(0, netRevenue - fixedTotal));

  const allocations: StakeholderAllocation[] = [
    ...fixed.map((s) => ({
      stakeholderType: s.stakeholderType,
      label: s.label,
      mode: s.mode,
      percentage: 0,
      amount: round2(s.fixedAmount),
    })),
    ...percent.map((s) => ({
      stakeholderType: s.stakeholderType,
      label: s.label,
      mode: s.mode,
      percentage: s.percentage,
      amount: round2((remaining * s.percentage) / 100),
    })),
  ];

  const totalAllocated = round2(allocations.reduce((acc, a) => acc + a.amount, 0));
  const remainder = round2(netRevenue - totalAllocated);

  return {
    gstAmount,
    tdsAmount,
    netRevenue,
    allocations,
    totalAllocated,
    remainder,
    isBalanced: Math.abs(remainder) < SHARE_SUM_TOLERANCE,
  };
}

function normalizeShare(input: StakeholderShare): StakeholderShare {
  return {
    stakeholderType: input.stakeholderType,
    label: input.label.trim(),
    mode: input.mode,
    percentage: input.mode === 'PERCENT' ? Number(input.percentage) || 0 : 0,
    fixedAmount: input.mode === 'FIXED' ? Number(input.fixedAmount) || 0 : 0,
  };
}

function resolveSharesAndTax(input: {
  ruleId?: string;
  shares?: StakeholderShare[];
  context?: SimulateInput['context'];
  gstPercent?: number;
  tdsPercent?: number;
}): { rule: DistributionRule | null; stakeholders: StakeholderShare[]; gstPercent: number; tdsPercent: number } {
  if (input.shares?.length) {
    const stakeholders = input.shares.map(normalizeShare);
    return {
      rule: null,
      stakeholders,
      gstPercent: input.gstPercent ?? DEFAULT_GST_PERCENT,
      tdsPercent: input.tdsPercent ?? DEFAULT_TDS_PERCENT,
    };
  }

  if (input.ruleId) {
    const rule = getRuleById(input.ruleId);
    if (!rule) throw new NotFoundError('Distribution rule', input.ruleId);
    return {
      rule,
      stakeholders: cloneShares(rule.stakeholders),
      gstPercent: input.gstPercent ?? rule.gstPercent,
      tdsPercent: input.tdsPercent ?? rule.tdsPercent,
    };
  }

  const rule = resolveMatchingRule(input.context ?? null);
  if (!rule) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No matching distribution rule found for the given context');
  }
  return {
    rule,
    stakeholders: cloneShares(rule.stakeholders),
    gstPercent: input.gstPercent ?? rule.gstPercent,
    tdsPercent: input.tdsPercent ?? rule.tdsPercent,
  };
}

export const revenueDistributionService = {
  summary(): DistributionSummary {
    const activeRules = listAllRules().filter((r) => r.isActive);
    const allRules = listAllRules();
    const allRuns = listAllRuns();
    const completed = allRuns.filter((r) => r.status === 'COMPLETED');
    const pending = allRuns.filter((r) => r.status === 'PENDING');

    const stakeholderKeys = new Set<string>();
    const typeSet = new Set<string>();
    let stakeholderCount = 0;
    for (const rule of activeRules) {
      stakeholderCount += rule.stakeholders.length;
      for (const s of rule.stakeholders) {
        stakeholderKeys.add(stakeholderKey(s));
        typeSet.add(s.stakeholderType);
      }
    }

    return {
      totalRules: allRules.length,
      activeRules: activeRules.length,
      inactiveRules: allRules.length - activeRules.length,
      totalRuns: allRuns.length,
      completedRuns: completed.length,
      pendingRuns: pending.length,
      totalDistributed: round2(completed.reduce((acc, r) => acc + r.netRevenue, 0)),
      totalGrossRevenue: round2(allRuns.reduce((acc, r) => acc + r.grossRevenue, 0)),
      totalGst: round2(allRuns.reduce((acc, r) => acc + r.gstAmount, 0)),
      totalTds: round2(allRuns.reduce((acc, r) => acc + r.tdsAmount, 0)),
      uniqueStakeholderTypes: typeSet.size,
      stakeholderCount,
    };
  },

  listRules(_user: AuthenticatedUser, query: ListRulesQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAllRules();

    if (query.scope) {
      items = items.filter((r) => r.scope === query.scope);
    }
    if (typeof query.isActive === 'boolean') {
      items = items.filter((r) => r.isActive === query.isActive);
    }
    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.scope.toLowerCase().includes(q) ||
          (r.matchingCriteria.product ?? '').toLowerCase().includes(q) ||
          (r.matchingCriteria.lenderName ?? '').toLowerCase().includes(q) ||
          (r.matchingCriteria.partnerTier ?? '').toLowerCase().includes(q),
      );
    }

    items = items.sort((a, b) => b.priority - a.priority || b.updatedAt.localeCompare(a.updatedAt));
    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), meta: buildPaginationMeta(page, limit, total) };
  },

  getRule(_user: AuthenticatedUser, id: string): DistributionRule {
    const rule = getRuleById(id);
    if (!rule) throw new NotFoundError('Distribution rule', id);
    return rule;
  },

  createRule(user: AuthenticatedUser, input: CreateRuleInput, ctx: RequestContext): DistributionRule {
    const stakeholders = input.stakeholders.map(normalizeShare);
    const gstPercent = input.gstPercent ?? DEFAULT_GST_PERCENT;
    const tdsPercent = input.tdsPercent ?? DEFAULT_TDS_PERCENT;
    assertTaxRatesValid(gstPercent, tdsPercent);
    assertStakeholdersValid(stakeholders);

    const now = new Date().toISOString();
    const rule: DistributionRule = {
      id: randomUUID(),
      name: input.name.trim(),
      scope: input.scope,
      matchingCriteria: {
        product: input.matchingCriteria?.product ?? null,
        lenderName: input.matchingCriteria?.lenderName ?? null,
        partnerId: input.matchingCriteria?.partnerId ?? null,
        partnerTier: input.matchingCriteria?.partnerTier ?? null,
      },
      stakeholders,
      gstPercent,
      tdsPercent,
      priority: input.priority ?? 10,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      deletedAt: null,
      deletedById: null,
    };

    saveRule(rule);
    pushAudit(
      {
        entityType: 'RULE',
        entityId: rule.id,
        action: 'RULE_CREATED',
        actorUserId: user.id,
        actorName: actorName(user),
        before: null,
        after: rule as unknown as Record<string, unknown>,
      },
      ctx,
    );
    return rule;
  },

  updateRule(
    user: AuthenticatedUser,
    id: string,
    input: UpdateRuleInput,
    ctx: RequestContext,
  ): DistributionRule {
    const existing = getRuleById(id);
    if (!existing) throw new NotFoundError('Distribution rule', id);

    const stakeholders = input.stakeholders ? input.stakeholders.map(normalizeShare) : existing.stakeholders;
    const gstPercent = input.gstPercent ?? existing.gstPercent;
    const tdsPercent = input.tdsPercent ?? existing.tdsPercent;
    assertTaxRatesValid(gstPercent, tdsPercent);
    assertStakeholdersValid(stakeholders);

    const before = { ...existing } as unknown as Record<string, unknown>;
    const updated: DistributionRule = {
      ...existing,
      name: input.name?.trim() ?? existing.name,
      scope: input.scope ?? existing.scope,
      matchingCriteria: input.matchingCriteria
        ? {
            product: input.matchingCriteria.product ?? null,
            lenderName: input.matchingCriteria.lenderName ?? null,
            partnerId: input.matchingCriteria.partnerId ?? null,
            partnerTier: input.matchingCriteria.partnerTier ?? null,
          }
        : existing.matchingCriteria,
      stakeholders,
      gstPercent,
      tdsPercent,
      priority: input.priority ?? existing.priority,
      isActive: typeof input.isActive === 'boolean' ? input.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    saveRule(updated);
    pushAudit(
      {
        entityType: 'RULE',
        entityId: updated.id,
        action: 'RULE_UPDATED',
        actorUserId: user.id,
        actorName: actorName(user),
        before,
        after: updated as unknown as Record<string, unknown>,
      },
      ctx,
    );
    return updated;
  },

  deleteRule(user: AuthenticatedUser, id: string, ctx: RequestContext): DistributionRule {
    const existing = getRuleById(id);
    if (!existing) throw new NotFoundError('Distribution rule', id);

    const before = { ...existing } as unknown as Record<string, unknown>;
    const updated: DistributionRule = {
      ...existing,
      isActive: false,
      deletedAt: new Date().toISOString(),
      deletedById: user.id,
      updatedAt: new Date().toISOString(),
    };
    saveRule(updated);
    pushAudit(
      {
        entityType: 'RULE',
        entityId: updated.id,
        action: 'RULE_DELETED',
        actorUserId: user.id,
        actorName: actorName(user),
        before,
        after: { deletedAt: updated.deletedAt },
      },
      ctx,
    );
    return updated;
  },

  simulate(_user: AuthenticatedUser, input: SimulateInput): SimulationResult {
    const resolved = resolveSharesAndTax(input);
    const computed = computeAllocations(
      input.grossRevenue,
      resolved.stakeholders,
      resolved.gstPercent,
      resolved.tdsPercent,
    );
    return {
      rule: resolved.rule,
      grossRevenue: input.grossRevenue,
      ...computed,
    };
  },

  createRun(user: AuthenticatedUser, input: CreateRunInput, ctx: RequestContext): DistributionRun {
    const resolved = resolveSharesAndTax(input);
    const computed = computeAllocations(
      input.grossRevenue,
      resolved.stakeholders,
      resolved.gstPercent,
      resolved.tdsPercent,
    );

    const run: DistributionRun = {
      id: randomUUID(),
      sourceRef: input.sourceRef.trim(),
      ruleId: resolved.rule?.id ?? input.ruleId ?? null,
      ruleName: resolved.rule?.name ?? null,
      grossRevenue: input.grossRevenue,
      allocations: computed.allocations,
      gstAmount: computed.gstAmount,
      tdsAmount: computed.tdsAmount,
      netRevenue: computed.netRevenue,
      status: input.status ?? 'COMPLETED',
      context: input.context ?? null,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    saveRun(run);
    pushAudit(
      {
        entityType: 'RUN',
        entityId: run.id,
        action: 'RUN_CREATED',
        actorUserId: user.id,
        actorName: actorName(user),
        before: null,
        after: run as unknown as Record<string, unknown>,
      },
      ctx,
    );
    return run;
  },

  listRuns(_user: AuthenticatedUser, query: ListRunsQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAllRuns();

    if (query.status) items = items.filter((r) => r.status === query.status);
    if (query.sourceRef) {
      const q = query.sourceRef.toLowerCase();
      items = items.filter((r) => r.sourceRef.toLowerCase().includes(q));
    }
    if (query.ruleId) items = items.filter((r) => r.ruleId === query.ruleId);
    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.sourceRef.toLowerCase().includes(q) ||
          (r.ruleName ?? '').toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q),
      );
    }

    items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), meta: buildPaginationMeta(page, limit, total) };
  },

  getRun(_user: AuthenticatedUser, id: string): DistributionRun {
    const run = getRunById(id);
    if (!run) throw new NotFoundError('Distribution run', id);
    return run;
  },

  listAudit(_user: AuthenticatedUser, query: ListAuditQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAllAudit();

    if (query.entityId) items = items.filter((e) => e.entityId === query.entityId);
    if (query.action) {
      const q = query.action.toLowerCase();
      items = items.filter((e) => e.action.toLowerCase().includes(q));
    }
    if (query.entityType) items = items.filter((e) => e.entityType === query.entityType);

    items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), meta: buildPaginationMeta(page, limit, total) };
  },
};
