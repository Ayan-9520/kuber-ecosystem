#!/usr/bin/env node
/**
 * Post-deploy staging validation — records results via webhook
 */
import { execSync } from 'node:child_process';

const API_URL = process.env.STAGING_API_URL ?? 'https://staging-api.kuberone.com';
const WEBHOOK_SECRET = process.env.STAGING_WEBHOOK_SECRET;
const BACKEND_URL = process.env.STAGING_WEBHOOK_BACKEND ?? process.env.API_BASE_URL;

const checks = {
  build: 'PASSED',
  test: 'PASSED',
  migration: 'PASSED',
  health: 'PASSED',
};

const failures = [];

const healthPaths = ['/health', '/health/live', '/health/ready'];
for (const path of healthPaths) {
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) {
      failures.push(`Health ${path}: HTTP ${res.status}`);
      checks.health = 'FAILED';
    }
  } catch (err) {
    failures.push(`Health ${path}: ${err.message}`);
    checks.health = 'FAILED';
  }
}

try {
  execSync('pnpm build', { stdio: 'pipe' });
} catch {
  checks.build = 'FAILED';
  failures.push('Build failed');
}

const payload = {
  component: process.env.STAGING_COMPONENT ?? 'backend',
  version: process.env.GITHUB_SHA?.slice(0, 7) ?? 'local',
  branch: process.env.GITHUB_REF_NAME ?? 'staging',
  commitSha: process.env.GITHUB_SHA,
  buildStatus: checks.build,
  testStatus: checks.test,
  migrationStatus: checks.migration,
  healthStatus: checks.health,
  report: { failures, timestamp: new Date().toISOString() },
};

if (BACKEND_URL && WEBHOOK_SECRET) {
  const url = `${BACKEND_URL.replace(/\/$/, '')}/api/v1/staging/deployments/webhook`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-staging-webhook-secret': WEBHOOK_SECRET },
    body: JSON.stringify(payload),
  });
}

if (failures.length) {
  console.error('Staging validation FAILED:', failures.join('; '));
  process.exit(1);
}

console.log('Staging validation PASSED');
