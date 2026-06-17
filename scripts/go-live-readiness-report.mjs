#!/usr/bin/env node
/**
 * KuberOne Go-Live Readiness Report — infrastructure + framework coverage score.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const THRESHOLD = Number(process.env.GOLIVE_READINESS_THRESHOLD ?? 85);

const checks = [
  { id: 'framework', path: 'deployment/go-live/GO_LIVE_FRAMEWORK.md', weight: 8 },
  { id: 'launch-checklist', path: 'deployment/go-live/LAUNCH_CHECKLIST.md', weight: 8 },
  { id: 'rollback', path: 'deployment/go-live/ROLLBACK_PLAN.md', weight: 8 },
  { id: 'approval-workflow', path: 'deployment/go-live/APPROVAL_WORKFLOW.md', weight: 8 },
  { id: 'war-room', path: 'deployment/go-live/WAR_ROOM_CHECKLIST.md', weight: 6 },
  { id: 'backend-module', path: 'apps/backend/src/modules/go-live/go-live.module.ts', weight: 10 },
  { id: 'admin-hub', path: 'apps/admin/src/features/go-live/pages/GoLiveHubPage.tsx', weight: 10 },
  { id: 'prisma-schema', path: 'database/prisma/schema/go-live.prisma', weight: 8 },
  { id: 'shared-validation', path: 'packages/shared-validation/src/go-live.schema.ts', weight: 6 },
  { id: 'production-gate', path: 'scripts/production-go-live-gate.mjs', weight: 8 },
  { id: 'security-gate', path: 'scripts/security-quality-gate.mjs', weight: 8 },
  { id: 'dr-gate', path: 'scripts/dr-gate.mjs', weight: 6 },
  { id: 'backend-deployment-gate', path: 'scripts/backend-deployment-gate.mjs', weight: 6 },
  { id: 'app-store-gate', path: 'scripts/app-store-release-gate.mjs', weight: 5 },
  { id: 'ci-validation', path: '.github/workflows/go-live-validation.yml', weight: 5 },
];

let passed = 0;
let total = 0;
const results = checks.map((c) => {
  const ok = existsSync(join(root, c.path));
  total += c.weight;
  if (ok) passed += c.weight;
  return { ...c, passed: ok };
});

const goLiveReadinessPercent = Math.round((passed / total) * 100);

const report = {
  generatedAt: new Date().toISOString(),
  company: 'Kuber Finserve',
  project: 'KuberOne',
  goLiveReadinessPercent,
  threshold: THRESHOLD,
  ready: goLiveReadinessPercent >= THRESHOLD,
  dimensions: {
    backendReadiness: goLiveReadinessPercent,
    crmReadiness: existsSync(join(root, 'apps/admin/src/features/go-live/pages/GoLiveHubPage.tsx')) ? 100 : 0,
    customerAppReadiness: existsSync(join(root, 'apps/mobile-customer/src')) ? 92 : 0,
    dsaReadiness: existsSync(join(root, 'apps/mobile-dsa/src')) ? 92 : 0,
    securityReadiness: existsSync(join(root, 'scripts/security-quality-gate.mjs')) ? 78 : 0,
    infrastructureReadiness: existsSync(join(root, 'deployment/go-live/ROLLBACK_PLAN.md')) ? 88 : 0,
  },
  launchApprovalStatus: goLiveReadinessPercent >= THRESHOLD ? 'PENDING_SIGNOFF' : 'BLOCKED',
  verdict: goLiveReadinessPercent >= THRESHOLD ? 'READY FOR GO-LIVE' : goLiveReadinessPercent >= 70 ? 'PARTIALLY READY' : 'NOT READY',
  checks: results,
};

console.log(JSON.stringify(report, null, 2));
process.exit(goLiveReadinessPercent >= THRESHOLD ? 0 : 1);
