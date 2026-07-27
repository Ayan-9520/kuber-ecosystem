import { randomUUID } from 'node:crypto';

import {
  DEFAULT_GST_PERCENT,
  DEFAULT_TDS_PERCENT,
} from '../constants/revenue-distribution.constants.js';
import type {
  DistributionAuditEvent,
  DistributionRule,
  DistributionRun,
  MatchingCriteria,
  RequestContext,
  StakeholderShare,
} from '../types/revenue-distribution.types.js';

const rules = new Map<string, DistributionRule>();
const runs = new Map<string, DistributionRun>();
const auditEvents: DistributionAuditEvent[] = [];

let seeded = false;

function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function seedRule(partial: Omit<DistributionRule, 'deletedAt' | 'deletedById'>): DistributionRule {
  const rule: DistributionRule = {
    ...partial,
    deletedAt: null,
    deletedById: null,
  };
  rules.set(rule.id, rule);
  return rule;
}

function seedRun(run: DistributionRun): DistributionRun {
  runs.set(run.id, run);
  return run;
}

export function ensureSeeded(): void {
  if (seeded) return;
  seeded = true;

  const ruleHomeLoan: DistributionRule = seedRule({
    id: 'a1000000-0000-4000-8000-0000000000d1',
    name: 'HDFC Home Loan — Standard Split',
    scope: 'PRODUCT',
    matchingCriteria: { product: 'Home Loan', lenderName: 'HDFC Bank', partnerId: null, partnerTier: null },
    stakeholders: [
      { stakeholderType: 'PARTNER', label: 'Financial Partner', mode: 'PERCENT', percentage: 55, fixedAmount: 0 },
      { stakeholderType: 'EMPLOYEE', label: 'Financial Professional', mode: 'PERCENT', percentage: 10, fixedAmount: 0 },
      { stakeholderType: 'TEAM_LEADER', label: 'Business Mentor', mode: 'PERCENT', percentage: 5, fixedAmount: 0 },
      { stakeholderType: 'COMPANY', label: 'KuberFinserve', mode: 'PERCENT', percentage: 30, fixedAmount: 0 },
    ],
    gstPercent: DEFAULT_GST_PERCENT,
    tdsPercent: DEFAULT_TDS_PERCENT,
    priority: 100,
    isActive: true,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(12),
    createdBy: 'seed-admin',
  });

  const ruleLap: DistributionRule = seedRule({
    id: 'a1000000-0000-4000-8000-0000000000d2',
    name: 'Bajaj LAP — Partner Heavy',
    scope: 'LENDER',
    matchingCriteria: {
      product: 'LAP',
      lenderName: 'Bajaj Finance',
      partnerId: null,
      partnerTier: null,
    },
    stakeholders: [
      { stakeholderType: 'PARTNER', label: 'Financial Partner', mode: 'PERCENT', percentage: 70, fixedAmount: 0 },
      { stakeholderType: 'EMPLOYEE', label: 'Financial Professional', mode: 'PERCENT', percentage: 8, fixedAmount: 0 },
      { stakeholderType: 'REFERRAL', label: 'Referral pool', mode: 'PERCENT', percentage: 2, fixedAmount: 0 },
      { stakeholderType: 'COMPANY', label: 'KuberFinserve', mode: 'PERCENT', percentage: 20, fixedAmount: 0 },
    ],
    gstPercent: DEFAULT_GST_PERCENT,
    tdsPercent: 2,
    priority: 90,
    isActive: true,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(8),
    createdBy: 'seed-admin',
  });

  seedRule({
    id: 'a1000000-0000-4000-8000-0000000000d3',
    name: 'Gold Partner Tier — Preferential',
    scope: 'PARTNER_TIER',
    matchingCriteria: {
      product: null,
      lenderName: null,
      partnerId: null,
      partnerTier: 'GOLD',
    },
    stakeholders: [
      { stakeholderType: 'PARTNER', label: 'Gold Financial Partner', mode: 'PERCENT', percentage: 65, fixedAmount: 0 },
      { stakeholderType: 'TEAM_LEADER', label: 'Business Mentor', mode: 'PERCENT', percentage: 7, fixedAmount: 0 },
      { stakeholderType: 'EMPLOYEE', label: 'Financial Professional', mode: 'PERCENT', percentage: 8, fixedAmount: 0 },
      { stakeholderType: 'COMPANY', label: 'KuberFinserve', mode: 'PERCENT', percentage: 20, fixedAmount: 0 },
    ],
    gstPercent: DEFAULT_GST_PERCENT,
    tdsPercent: DEFAULT_TDS_PERCENT,
    priority: 80,
    isActive: true,
    createdAt: daysAgo(28),
    updatedAt: daysAgo(5),
    createdBy: 'seed-admin',
  });

  seedRule({
    id: 'a1000000-0000-4000-8000-0000000000d4',
    name: 'Platform Default Split',
    scope: 'DEFAULT',
    matchingCriteria: { product: null, lenderName: null, partnerId: null, partnerTier: null },
    stakeholders: [
      { stakeholderType: 'PARTNER', label: 'Financial Partner', mode: 'PERCENT', percentage: 50, fixedAmount: 0 },
      { stakeholderType: 'EMPLOYEE', label: 'Financial Professional', mode: 'PERCENT', percentage: 12, fixedAmount: 0 },
      { stakeholderType: 'TEAM_LEADER', label: 'Business Mentor', mode: 'PERCENT', percentage: 8, fixedAmount: 0 },
      { stakeholderType: 'COMPANY', label: 'KuberFinserve', mode: 'PERCENT', percentage: 30, fixedAmount: 0 },
    ],
    gstPercent: DEFAULT_GST_PERCENT,
    tdsPercent: DEFAULT_TDS_PERCENT,
    priority: 1,
    isActive: true,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(20),
    createdBy: 'seed-admin',
  });

  const run1Allocations = [
    { stakeholderType: 'PARTNER' as const, label: 'Financial Partner', mode: 'PERCENT' as const, percentage: 55, amount: 52827.5 },
    { stakeholderType: 'EMPLOYEE' as const, label: 'Financial Professional', mode: 'PERCENT' as const, percentage: 10, amount: 9605 },
    { stakeholderType: 'TEAM_LEADER' as const, label: 'Business Mentor', mode: 'PERCENT' as const, percentage: 5, amount: 4802.5 },
    { stakeholderType: 'COMPANY' as const, label: 'KuberFinserve', mode: 'PERCENT' as const, percentage: 30, amount: 28815 },
  ];

  seedRun({
    id: 'b1000000-0000-4000-8000-0000000000e1',
    sourceRef: 'CASE-HL-8821',
    ruleId: ruleHomeLoan.id,
    ruleName: ruleHomeLoan.name,
    grossRevenue: 85000,
    allocations: run1Allocations,
    gstAmount: 15300,
    tdsAmount: 4250,
    netRevenue: 96050,
    status: 'COMPLETED',
    context: { product: 'Home Loan', lenderName: 'HDFC Bank' },
    createdAt: daysAgo(10),
    createdBy: 'seed-admin',
  });

  const run2Allocations = [
    { stakeholderType: 'PARTNER' as const, label: 'Financial Partner', mode: 'PERCENT' as const, percentage: 70, amount: 97440 },
    { stakeholderType: 'EMPLOYEE' as const, label: 'Financial Professional', mode: 'PERCENT' as const, percentage: 8, amount: 11136 },
    { stakeholderType: 'REFERRAL' as const, label: 'Referral pool', mode: 'PERCENT' as const, percentage: 2, amount: 2784 },
    { stakeholderType: 'COMPANY' as const, label: 'KuberFinserve', mode: 'PERCENT' as const, percentage: 20, amount: 27840 },
  ];

  seedRun({
    id: 'b1000000-0000-4000-8000-0000000000e2',
    sourceRef: 'CASE-LAP-8830',
    ruleId: ruleLap.id,
    ruleName: ruleLap.name,
    grossRevenue: 120000,
    allocations: run2Allocations,
    gstAmount: 21600,
    tdsAmount: 2400,
    netRevenue: 139200,
    status: 'PENDING',
    context: { product: 'LAP', lenderName: 'Bajaj Finance' },
    createdAt: daysAgo(4),
    createdBy: 'seed-finance',
  });

  pushAudit({
    entityType: 'RULE',
    entityId: ruleHomeLoan.id,
    action: 'RULE_SEEDED',
    actorUserId: 'seed-admin',
    actorName: 'System',
    before: null,
    after: { name: ruleHomeLoan.name },
    ipAddress: null,
  });

  pushAudit({
    entityType: 'RUN',
    entityId: 'b1000000-0000-4000-8000-0000000000e1',
    action: 'RUN_COMPLETED',
    actorUserId: 'seed-admin',
    actorName: 'System',
    before: null,
    after: { sourceRef: 'CASE-HL-8821', netRevenue: 96050 },
    ipAddress: null,
  });
}

export function listAllRules(includeDeleted = false): DistributionRule[] {
  ensureSeeded();
  return Array.from(rules.values()).filter((r) => includeDeleted || !r.deletedAt);
}

export function getRuleById(id: string, includeDeleted = false): DistributionRule | undefined {
  ensureSeeded();
  const rule = rules.get(id);
  if (!rule) return undefined;
  if (!includeDeleted && rule.deletedAt) return undefined;
  return rule;
}

export function saveRule(rule: DistributionRule): DistributionRule {
  ensureSeeded();
  rules.set(rule.id, rule);
  return rule;
}

export function listAllRuns(): DistributionRun[] {
  ensureSeeded();
  return Array.from(runs.values());
}

export function getRunById(id: string): DistributionRun | undefined {
  ensureSeeded();
  return runs.get(id);
}

export function saveRun(run: DistributionRun): DistributionRun {
  ensureSeeded();
  runs.set(run.id, run);
  return run;
}

export function listAllAudit(): DistributionAuditEvent[] {
  ensureSeeded();
  return [...auditEvents];
}

export function pushAudit(
  input: Omit<DistributionAuditEvent, 'id' | 'createdAt'> & { createdAt?: string },
  ctx?: RequestContext,
): DistributionAuditEvent {
  ensureSeeded();
  const event: DistributionAuditEvent = {
    id: randomUUID(),
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    actorUserId: input.actorUserId,
    actorName: input.actorName,
    before: input.before ?? null,
    after: input.after ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
    ipAddress: input.ipAddress ?? ctx?.ipAddress ?? null,
  };
  auditEvents.push(event);
  return event;
}

/** Score how well a rule matches the given context (higher = better). */
export function scoreRuleMatch(rule: DistributionRule, context?: MatchingCriteria | null): number {
  if (!rule.isActive || rule.deletedAt) return -1;
  if (!context) {
    return rule.scope === 'DEFAULT' ? rule.priority : -1;
  }

  const criteria = rule.matchingCriteria ?? {};
  let score = rule.priority;

  if (rule.scope === 'DEFAULT') {
    return score;
  }

  if (criteria.product) {
    if (!context.product || criteria.product.toLowerCase() !== context.product.toLowerCase()) {
      return -1;
    }
    score += 50;
  }
  if (criteria.lenderName) {
    if (!context.lenderName || criteria.lenderName.toLowerCase() !== context.lenderName.toLowerCase()) {
      return -1;
    }
    score += 40;
  }
  if (criteria.partnerTier) {
    if (!context.partnerTier || criteria.partnerTier.toLowerCase() !== context.partnerTier.toLowerCase()) {
      return -1;
    }
    score += 30;
  }
  if (criteria.partnerId) {
    if (!context.partnerId || criteria.partnerId !== context.partnerId) {
      return -1;
    }
    score += 60;
  }

  return score;
}

export function resolveMatchingRule(context?: MatchingCriteria | null): DistributionRule | null {
  ensureSeeded();
  let best: DistributionRule | null = null;
  let bestScore = -1;
  for (const rule of listAllRules()) {
    const score = scoreRuleMatch(rule, context);
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }
  return best;
}

export function cloneShares(shares: StakeholderShare[]): StakeholderShare[] {
  return shares.map((s) => ({ ...s }));
}
