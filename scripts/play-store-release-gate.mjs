#!/usr/bin/env node
/** Play Store release quality gate */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/mobile/play-store/DEPLOYMENT_GUIDE.md',
  'deployment/mobile/play-store/listings/customer-listing.json',
  'deployment/mobile/play-store/listings/dsa-listing.json',
  'deployment/mobile/play-store/COMPLIANCE_CHECKLIST.md',
  'deployment/mobile/play-store/LAUNCH_CHECKLIST.md',
  '.github/workflows/play-store-release.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

try {
  execSync('node scripts/android-release-gate.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('Android release gate failed');
}

if (failures.length) {
  console.error('Play Store release gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Play Store release gate PASSED');
