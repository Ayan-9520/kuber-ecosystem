#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/mobile/app-store/DEPLOYMENT_GUIDE.md',
  'deployment/mobile/app-store/listings/customer-listing.json',
  'deployment/mobile/app-store/COMPLIANCE_CHECKLIST.md',
  'deployment/mobile/app-store/APP_REVIEW_READINESS.md',
  'deployment/mobile/app-store/SUBMISSION_CHECKLIST.md',
  '.github/workflows/app-store-release.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

for (const app of ['mobile-customer', 'mobile-dsa']) {
  if (!existsSync(join(root, 'apps', app, 'PrivacyInfo.xcprivacy'))) {
    failures.push(`Missing PrivacyInfo.xcprivacy: ${app}`);
  }
}

try {
  execSync('node scripts/app-store-readiness-report.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('App Store readiness report below threshold');
}

if (failures.length) {
  console.error('App Store release gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('App Store release gate PASSED');
