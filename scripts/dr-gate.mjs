#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/dr/DISASTER_RECOVERY_PLAN.md',
  'deployment/dr/FAILOVER_PROCEDURES.md',
  'apps/backend/src/modules/dr/dr.module.ts',
  '.github/workflows/dr-drill.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

try {
  execSync('node scripts/dr-readiness-report.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('DR readiness report below threshold');
}

if (failures.length) {
  console.error('DR gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('DR gate PASSED');
