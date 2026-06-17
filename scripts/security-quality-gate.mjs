#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const CRITICAL_SUITES = [
  'apps/backend/tests/security/authentication.security.test.ts',
  'apps/backend/tests/security/authorization.security.test.ts',
  'apps/backend/tests/security/api-injection.security.test.ts',
  'apps/backend/tests/security/ai.security.test.ts',
  'apps/admin/tests/security/crm.security.test.tsx',
  'apps/mobile-customer/tests/security/mobile.security.test.ts',
  'apps/mobile-dsa/tests/security/mobile.security.test.ts',
];

for (const suite of CRITICAL_SUITES) {
  if (!existsSync(join(root, suite))) {
    failures.push(`Missing critical security suite: ${suite}`);
  }
}

const reportPath = join(root, 'security-testing', 'reports', 'security-coverage-report.json');
if (existsSync(reportPath)) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (report.scores.overall < 75) {
    failures.push(`Overall security score below gate: ${report.scores.overall}% (min 75%)`);
  }
  if (report.owaspCoveragePercent < 90) {
    failures.push(`OWASP coverage below gate: ${report.owaspCoveragePercent}%`);
  }
  if (report.rbacCoveragePercent < 70) {
    failures.push(`RBAC coverage below gate: ${report.rbacCoveragePercent}%`);
  }
  if (report.criticalFindings?.length) {
    failures.push(`Critical findings: ${report.criticalFindings.join('; ')}`);
  }
  if (report.highFindings?.length) {
    failures.push(`High findings: ${report.highFindings.join('; ')}`);
  }
} else {
  failures.push('Missing security-coverage-report.json — run pnpm security:report first');
}

const scanPath = join(root, 'security-testing', 'reports', 'security-scan-report.json');
if (existsSync(scanPath)) {
  const scan = JSON.parse(readFileSync(scanPath, 'utf8'));
  if (scan.criticalCount > 0) {
    failures.push(`Dependency scan: ${scan.criticalCount} critical vulnerabilities`);
  }
  if (scan.highCount > 0) {
    failures.push(`Dependency scan: ${scan.highCount} high vulnerabilities`);
  }
}

if (failures.length) {
  console.error('Security quality gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Security quality gate PASSED');
