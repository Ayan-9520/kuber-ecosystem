#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const REQUIRED = [
  'performance-testing/k6/smoke.js',
  'performance-testing/k6/load.js',
  'apps/backend/tests/performance/api-latency.performance.test.ts',
  'apps/admin/tests/performance/dashboard.performance.test.tsx',
];

for (const f of REQUIRED) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

const reportPath = join(root, 'performance-testing/reports/performance-coverage-report.json');
if (existsSync(reportPath)) {
  const r = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (r.metrics.p95ResponseMs > 500) {
    failures.push(`P95 ${r.metrics.p95ResponseMs}ms exceeds 500ms gate`);
  }
  if (r.metrics.p99ResponseMs > 1000) {
    failures.push(`P99 ${r.metrics.p99ResponseMs}ms exceeds 1000ms gate`);
  }
  if (r.scores.readiness < 75) {
    failures.push(`Readiness ${r.scores.readiness}% below 75% gate`);
  }
} else {
  failures.push('Missing performance-coverage-report.json — run pnpm perf:report');
}

if (failures.length) {
  console.error('Performance quality gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}
console.log('Performance quality gate PASSED');
