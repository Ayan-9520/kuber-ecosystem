#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/backend/DEPLOYMENT_GUIDE.md',
  'deployment/backend/HEALTH_CHECKS.md',
  'deployment/docker/docker-compose.production.yml',
  'apps/backend/src/modules/backend-deployment/backend-deployment.module.ts',
  '.github/workflows/backend-production-deploy.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

try {
  execSync('node scripts/backend-deployment-readiness-report.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('Backend deployment readiness report below threshold');
}

if (failures.length) {
  console.error('Backend deployment gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Backend deployment gate PASSED');
