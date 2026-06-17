#!/usr/bin/env node
/**
 * KuberOne performance test orchestrator — k6 and Artillery.
 * Usage: node scripts/perf-run.mjs [smoke|load|stress|spike|endurance|tier] [--vus 100]
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportsDir = join(root, 'performance-testing', 'reports');
mkdirSync(reportsDir, { recursive: true });

const mode = process.argv[2] || 'smoke';
const vusArg = process.argv.find((a) => a.startsWith('--vus='));
const VUS = vusArg ? vusArg.split('=')[1] : process.env.VUS || '100';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

const k6Scripts = {
  smoke: 'performance-testing/k6/smoke.js',
  load: 'performance-testing/k6/load.js',
  stress: 'performance-testing/k6/stress.js',
  spike: 'performance-testing/k6/spike.js',
  endurance: 'performance-testing/k6/endurance.js',
  tier: 'performance-testing/k6/load-tiers.js',
};

const artilleryScripts = {
  smoke: 'performance-testing/artillery/smoke.yml',
  load: 'performance-testing/artillery/load.yml',
  stress: 'performance-testing/artillery/stress.yml',
  spike: 'performance-testing/artillery/spike.yml',
  endurance: 'performance-testing/artillery/endurance.yml',
};

function hasK6() {
  try {
    execSync('k6 version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function runK6(script) {
  const full = join(root, script);
  if (!existsSync(full)) throw new Error(`Missing k6 script: ${script}`);
  const outFile = join(reportsDir, `k6-${mode}-summary.json`);
  const args = [
    'run',
    '--summary-export',
    outFile,
    '-e',
    `BASE_URL=${BASE_URL}`,
    '-e',
    `VUS=${VUS}`,
    full,
  ];
  if (process.env.ENDURANCE_DURATION) {
    args.push('-e', `ENDURANCE_DURATION=${process.env.ENDURANCE_DURATION}`);
  }
  const r = spawnSync('k6', args, { stdio: 'inherit', cwd: root, env: process.env });
  return { exitCode: r.status ?? 1, outFile };
}

function runArtillery(script) {
  const full = join(root, script);
  const outFile = join(reportsDir, `artillery-${mode}.json`);
  const r = spawnSync(
    'pnpm',
    ['exec', 'artillery', 'run', '--output', outFile, full],
    { stdio: 'inherit', cwd: root, env: { ...process.env, BASE_URL } },
  );
  return { exitCode: r.status ?? 1, outFile };
}

const result = { mode, baseUrl: BASE_URL, vus: VUS, k6: null, artillery: null, skipped: [] };

if (hasK6() && k6Scripts[mode]) {
  result.k6 = runK6(k6Scripts[mode]);
} else {
  result.skipped.push('k6 not installed — install from https://k6.io/docs/get-started/installation/');
}

if (artilleryScripts[mode]) {
  try {
    result.artillery = runArtillery(artilleryScripts[mode]);
  } catch {
    result.skipped.push('artillery run failed');
  }
}

writeFileSync(join(reportsDir, `perf-run-${mode}.json`), JSON.stringify(result, null, 2));

const failed =
  (result.k6 && result.k6.exitCode !== 0) || (result.artillery && result.artillery.exitCode !== 0);

if (failed && result.k6) process.exit(result.k6.exitCode || 1);
if (!result.k6 && result.skipped.length) {
  console.warn('Performance load tools skipped:', result.skipped.join('; '));
  console.warn('Jest performance suites still run via pnpm perf:test');
  process.exit(0);
}

console.log(`Performance run complete: ${mode}`);
