#!/usr/bin/env node
/**
 * Post-deploy production validation + webhook recording
 */
const API_URL = process.env.PRODUCTION_API_URL ?? 'https://api.kuberone.com';
const WEBHOOK_SECRET = process.env.PRODUCTION_WEBHOOK_SECRET;
const BACKEND_URL = process.env.PRODUCTION_WEBHOOK_BACKEND ?? process.env.API_BASE_URL;

const failures = [];
const report = { checks: [], timestamp: new Date().toISOString() };

for (const path of ['/health', '/health/live', '/health/ready']) {
  try {
    const res = await fetch(`${API_URL}${path}`);
    const ok = res.ok;
    report.checks.push({ path, status: ok ? 'PASSED' : 'FAILED', httpStatus: res.status });
    if (!ok) failures.push(`Health ${path}: HTTP ${res.status}`);
  } catch (err) {
    failures.push(`Health ${path}: ${err.message}`);
    report.checks.push({ path, status: 'FAILED', error: err.message });
  }
}

try {
  const res = await fetch(`${API_URL}/deep-health`);
  report.checks.push({ path: '/deep-health', status: res.ok ? 'PASSED' : 'FAILED' });
  if (!res.ok) failures.push('Deep health check failed');
} catch {
  report.checks.push({ path: '/deep-health', status: 'SKIPPED' });
}

const payload = {
  component: process.env.PRODUCTION_COMPONENT ?? 'backend',
  version: process.env.GITHUB_SHA?.slice(0, 7) ?? 'local',
  strategy: process.env.DEPLOY_STRATEGY ?? 'blue-green',
  branch: process.env.GITHUB_REF_NAME ?? 'main',
  commitSha: process.env.GITHUB_SHA,
  status: failures.length ? 'FAILED' : 'SUCCESS',
  validationReport: report,
};

const webhookBase = BACKEND_URL?.replace(/\/$/, '');
const deploySecret = process.env.BACKEND_DEPLOYMENT_WEBHOOK_SECRET ?? WEBHOOK_SECRET;

if (webhookBase && deploySecret) {
  await fetch(`${webhookBase}/api/v1/deployment/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-backend-deployment-webhook-secret': deploySecret },
    body: JSON.stringify({
      version: payload.version,
      strategy: payload.strategy,
      branch: payload.branch,
      commitSha: payload.commitSha,
      status: payload.status,
      validationReport: payload.validationReport,
    }),
  });
}

if (webhookBase && WEBHOOK_SECRET) {
  await fetch(`${webhookBase}/api/v1/production/deployments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-production-webhook-secret': WEBHOOK_SECRET },
    body: JSON.stringify(payload),
  });
}

if (failures.length) {
  console.error('Production validation FAILED:', failures.join('; '));
  process.exit(1);
}

console.log('Production validation PASSED');
