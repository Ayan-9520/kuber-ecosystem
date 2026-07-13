#!/usr/bin/env node
/**
 * Optional Windows helper — sequential builds to avoid Docker Desktop OOM.
 * Default:  docker compose up -d --build
 */
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runEnv = { ...process.env, COMPOSE_PARALLEL_LIMIT: '1', DOCKER_BUILDKIT: '1' };

const BUILD_ORDER = ['backend', 'admin', 'web-public', 'mobile-customer', 'mobile-dsa', 'nginx'];

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd: root, stdio: 'inherit', env: runEnv });
}

const rebuild = process.argv.includes('--build') || process.argv.includes('-b');
if (rebuild) {
  for (const svc of BUILD_ORDER) run(`docker compose build ${svc}`);
}
run('docker compose up -d');
