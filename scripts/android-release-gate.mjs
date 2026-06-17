#!/usr/bin/env node
/**
 * Android release quality gate — run before store upload
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const apps = ['mobile-customer', 'mobile-dsa'];

for (const app of apps) {
  const appConfig = join(root, 'apps', app, 'app.config.ts');
  const easConfig = join(root, 'apps', app, 'eas.json');
  if (!existsSync(appConfig)) failures.push(`Missing app.config.ts: ${app}`);
  if (!existsSync(easConfig)) failures.push(`Missing eas.json: ${app}`);
}

for (const app of apps) {
  try {
    execSync(`pnpm --filter @kuberone/${app} test`, { cwd: root, stdio: 'pipe' });
  } catch {
    failures.push(`${app}: unit tests failed`);
  }
  try {
    execSync(`pnpm --filter @kuberone/${app} exec jest tests/security --runInBand`, { cwd: root, stdio: 'pipe' });
  } catch {
    failures.push(`${app}: security tests failed`);
  }
}

try {
  execSync('node scripts/mobile-quality-gate.mjs', { cwd: root, stdio: 'pipe' });
} catch {
  failures.push('Mobile quality gate failed');
}

if (failures.length) {
  console.error('Android release gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Android release gate PASSED');
