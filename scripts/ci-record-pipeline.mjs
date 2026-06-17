#!/usr/bin/env node
/**
 * Records pipeline run to DevOps API (optional) or writes local artifact.
 * Usage: node scripts/ci-record-pipeline.mjs --type BUILD --name "Build main" --status SUCCESS
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

const payload = {
  pipelineType: getArg('--type') ?? process.env.PIPELINE_TYPE ?? 'BUILD',
  name: getArg('--name') ?? process.env.PIPELINE_NAME ?? 'CI Pipeline',
  branch: getArg('--branch') ?? process.env.GITHUB_REF_NAME,
  commitSha: getArg('--sha') ?? process.env.GITHUB_SHA,
  prNumber: getArg('--pr') ? Number(getArg('--pr')) : undefined,
  status: getArg('--status') ?? 'SUCCESS',
  workflowUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined,
  triggeredBy: process.env.GITHUB_ACTOR ?? 'ci',
  durationMs: getArg('--duration') ? Number(getArg('--duration')) : undefined,
};

const apiUrl = process.env.DEVOPS_API_URL ?? process.env.API_BASE_URL;
const secret = process.env.DEVOPS_WEBHOOK_SECRET;

if (apiUrl && secret) {
  const url = `${apiUrl.replace(/\/$/, '')}/api/v1/devops/pipelines/webhook`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-devops-webhook-secret': secret,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.warn(`DevOps webhook failed (${res.status}), writing local artifact`);
  } else {
    console.log('Pipeline recorded to DevOps API');
    process.exit(0);
  }
}

const outDir = join(root, 'devops', 'artifacts');
mkdirSync(outDir, { recursive: true });
const file = join(outDir, `pipeline-${Date.now()}.json`);
writeFileSync(file, JSON.stringify(payload, null, 2));
console.log('Pipeline artifact written:', file);
