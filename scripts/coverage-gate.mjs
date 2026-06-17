#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const THRESHOLD = Number(process.env.COVERAGE_THRESHOLD ?? 50);

const reportPaths = [
  join(root, 'apps', 'backend', 'coverage', 'coverage-summary.json'),
  join(root, 'apps', 'admin', 'coverage', 'coverage-summary.json'),
];

const failures = [];

for (const path of reportPaths) {
  if (!existsSync(path)) {
    failures.push(`Missing coverage report: ${path}`);
    continue;
  }
  const summary = JSON.parse(readFileSync(path, 'utf8'));
  const total = summary.total?.lines?.pct ?? 0;
  const label = path.includes('backend') ? 'backend' : 'admin';
  if (total < THRESHOLD) {
    failures.push(`${label} line coverage ${total}% below threshold ${THRESHOLD}%`);
  } else {
    console.log(`${label} coverage: ${total}%`);
  }
}

if (failures.length) {
  console.error('Coverage quality gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Coverage quality gate PASSED');
