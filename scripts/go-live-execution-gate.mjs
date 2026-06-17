#!/usr/bin/env node
/**
 * KuberOne Go-Live Execution gate — validates launch command center infrastructure.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/go-live/LAUNCH_EXECUTION_FRAMEWORK.md',
  'deployment/go-live/INCIDENT_WORKFLOW.md',
  'database/prisma/schema/go-live-execution.prisma',
  'database/prisma/schema/migrations/20260612310000_add_go_live_execution/migration.sql',
  'apps/backend/src/modules/go-live/services/go-live-execution.service.ts',
  'apps/backend/src/modules/go-live/constants/go-live-execution.constants.ts',
  'apps/admin/src/features/go-live/pages/GoLiveHubPage.tsx',
  '.github/workflows/go-live-execution-validation.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

try {
  execSync('node scripts/go-live-gate.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('Pre-launch go-live gate failed');
}

if (failures.length) {
  console.error('❌ Go-Live Execution gate BLOCKED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('✅ Go-Live Execution gate PASSED — command center ready');
