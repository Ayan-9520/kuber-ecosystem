import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = path.join(__dirname, '../.artifacts');
const coveredFlowsFile = path.join(artifactsDir, 'covered-flows.json');

const ALL_FLOWS = [
  'auth.send-otp',
  'auth.verify-otp',
  'auth.login',
  'auth.refresh',
  'auth.logout',
  'auth.logout-all',
  'auth.session-validation',
  'rbac.role-assignment',
  'rbac.permission-resolution',
  'rbac.data-scope',
  'rbac.branch-scope',
  'rbac.region-scope',
  'rbac.organization-scope',
  'customer.create',
  'customer.kyc',
  'customer.document',
  'customer.application',
  'customer.loan-journey',
  'customer.support',
  'customer.referral',
  'kyc.pan',
  'kyc.aadhaar',
  'kyc.approval',
  'kyc.audit',
  'lms.lead-create',
  'lms.lead-assign',
  'lms.lead-score',
  'lms.lead-followup',
  'lms.lead-convert',
  'lms.application-create',
  'los.application',
  'los.eligibility',
  'los.document-verification',
  'los.credit-review',
  'los.sanction',
  'los.disbursement',
  'los.closure',
  'document.upload',
  'document.ocr',
  'document.verify',
  'document.approval',
  'document.rejection',
  'document.download',
  'referral.create',
  'referral.validate',
  'referral.conversion',
  'referral.reward-approval',
  'referral.reward-payment',
  'commission.calculate',
  'commission.approval',
  'commission.payment',
  'commission.recovery',
  'commission.ledger',
  'support.ticket-create',
  'support.ticket-assign',
  'support.ticket-escalate',
  'support.ticket-resolve',
  'support.ticket-close',
  'notification.email',
  'notification.sms',
  'notification.whatsapp',
  'notification.push',
  'notification.in-app',
  'ai.advisor',
  'ai.voice',
  'ai.lead-scoring',
  'ai.recommendations',
  'ai.knowledge',
  'ai.rag',
  'ai.openai-layer',
  'campaign.create',
  'campaign.approval',
  'campaign.execution',
  'campaign.automation',
  'campaign.analytics',
  'database.transactions',
  'database.foreign-keys',
  'database.cascade-rules',
  'database.soft-delete',
  'database.audit',
  'api.success',
  'api.validation',
  'api.rbac-error',
  'api.pagination',
  'api.filtering',
  'api.sorting',
  'mobile.customer-api',
  'mobile.dsa-api',
] as const;

const FLOW_MODULES: Record<string, string> = {
  auth: 'auth',
  rbac: 'rbac',
  customer: 'customers',
  kyc: 'kyc',
  lms: 'leads',
  los: 'applications',
  document: 'documents',
  referral: 'referrals',
  commission: 'commissions',
  support: 'support',
  notification: 'notifications',
  ai: 'ai-platform',
  campaign: 'campaigns',
  database: 'database',
  api: 'api-contract',
  mobile: 'mobile-apis',
};

function readPersistedFlows(): Set<string> {
  if (!existsSync(coveredFlowsFile)) return new Set();
  const parsed = JSON.parse(readFileSync(coveredFlowsFile, 'utf8')) as string[];
  return new Set(parsed);
}

function persistFlows(flows: Set<string>): void {
  mkdirSync(artifactsDir, { recursive: true });
  writeFileSync(coveredFlowsFile, JSON.stringify([...flows].sort(), null, 2));
}

const coveredFlows = new Set<string>();

export function markFlow(flow: (typeof ALL_FLOWS)[number] | string): void {
  coveredFlows.add(flow);
  const persisted = readPersistedFlows();
  persisted.add(flow);
  persistFlows(persisted);
}

export function initFlowCoverage(): void {
  coveredFlows.clear();
  for (const flow of readPersistedFlows()) {
    coveredFlows.add(flow);
  }
}

export function resetFlowCoverage(): void {
  coveredFlows.clear();
  persistFlows(new Set());
}

export function flushFlowCoverage(): {
  totalFlows: number;
  coveredFlows: number;
  coveragePercent: number;
  flows: string[];
  missing: string[];
  moduleCoverage: Array<{ module: string; covered: number; total: number; percent: number }>;
} {
  for (const flow of readPersistedFlows()) {
    coveredFlows.add(flow);
  }

  const flows = [...coveredFlows].sort();
  const missing = ALL_FLOWS.filter((flow) => !coveredFlows.has(flow));
  const covered = ALL_FLOWS.filter((flow) => coveredFlows.has(flow)).length;

  const moduleStats = new Map<string, { covered: number; total: number }>();
  for (const flow of ALL_FLOWS) {
    const module = FLOW_MODULES[flow.split('.')[0] ?? ''] ?? 'other';
    const current = moduleStats.get(module) ?? { covered: 0, total: 0 };
    current.total += 1;
    if (coveredFlows.has(flow)) current.covered += 1;
    moduleStats.set(module, current);
  }

  const moduleCoverage = [...moduleStats.entries()]
    .map(([module, stats]) => ({
      module,
      covered: stats.covered,
      total: stats.total,
      percent: Math.round((stats.covered / stats.total) * 1000) / 10,
    }))
    .sort((a, b) => a.module.localeCompare(b.module));

  return {
    totalFlows: ALL_FLOWS.length,
    coveredFlows: covered,
    coveragePercent: Math.round((covered / ALL_FLOWS.length) * 1000) / 10,
    flows,
    missing,
    moduleCoverage,
  };
}
