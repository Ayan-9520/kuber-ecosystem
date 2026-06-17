#!/usr/bin/env node
/**
 * KuberOne Go-Live gate — blocks production launch if critical conditions fail.
 * Chains: production-go-live-gate, go-live readiness report, infrastructure checks.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/go-live/GO_LIVE_FRAMEWORK.md',
  'deployment/go-live/LAUNCH_CHECKLIST.md',
  'deployment/go-live/ROLLBACK_PLAN.md',
  'apps/backend/src/modules/go-live/go-live.module.ts',
  'apps/admin/src/features/go-live/pages/GoLiveHubPage.tsx',
  'database/prisma/schema/go-live.prisma',
  '.github/workflows/go-live-validation.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

try {
  execSync('node scripts/production-go-live-gate.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('Production go-live gate failed (critical bugs / UAT / backup / security / migrations)');
}

try {
  execSync('node scripts/go-live-readiness-report.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('Go-Live readiness below threshold (85%)');
}

if (failures.length) {
  console.error('❌ Go-Live gate BLOCKED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('✅ Go-Live gate PASSED — ready for launch approval workflow');
