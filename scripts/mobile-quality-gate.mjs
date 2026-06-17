#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CRITICAL = [
  { app: 'mobile-customer', test: 'tests/integration/auth/auth-flow.test.ts', flow: 'auth:otp-login' },
  { app: 'mobile-dsa', test: 'tests/integration/auth/auth-flow.test.ts', flow: 'auth:otp-login' },
  { app: 'mobile-customer', test: 'tests/services/auth.service.test.ts', flow: 'auth:token-refresh' },
  { app: 'mobile-customer', test: 'tests/screens/application-screens.test.tsx', flow: 'customer:application-flow' },
  { app: 'mobile-customer', test: 'tests/screens/application-screens.test.tsx', flow: 'customer:document-upload' },
  { app: 'mobile-dsa', test: 'tests/screens/leads-screens.test.tsx', flow: 'dsa:lead-flow' },
  { app: 'mobile-dsa', test: 'tests/screens/commissions-screens.test.tsx', flow: 'dsa:commission-view' },
];

const failures = [];

for (const gate of CRITICAL) {
  const path = join(root, 'apps', gate.app, gate.test);
  if (!existsSync(path)) {
    failures.push(`Missing critical test: ${gate.app}/${gate.test} (${gate.flow})`);
  }
}

const reportPath = join(root, 'mobile-testing', 'reports', 'mobile-coverage-report.json');
if (existsSync(reportPath)) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (report.customer.screenCoveragePercent < 50) {
    failures.push(`Customer screen coverage below gate: ${report.customer.screenCoveragePercent}%`);
  }
  if (report.dsa.screenCoveragePercent < 45) {
    failures.push(`DSA screen coverage below gate: ${report.dsa.screenCoveragePercent}%`);
  }
}

if (failures.length) {
  console.error('Mobile quality gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Mobile quality gate PASSED');
