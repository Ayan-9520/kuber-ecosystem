#!/usr/bin/env node
/** Validate Docker stack: config → build → health checks */
import { execSync } from 'node:child_process';
import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = {
  env: { ...process.env, COMPOSE_PARALLEL_LIMIT: process.env.COMPOSE_PARALLEL_LIMIT ?? '2' },
  cwd: root,
  stdio: 'inherit',
};

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, env);
}

function checkUrl(url, label) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        console.log(`${ok ? '✅' : '❌'} ${label}: ${url} (${res.statusCode})`);
        res.resume();
        resolve(ok);
      })
      .on('error', (err) => {
        console.log(`❌ ${label}: ${url} (${err.message})`);
        resolve(false);
      });
  });
}

async function main() {
  run('docker compose config --quiet');
  run('docker compose up -d --build');

  console.log('\nWaiting 30s for services...');
  await new Promise((r) => setTimeout(r, 30_000));

  run('docker compose ps');

  const checks = await Promise.all([
    checkUrl('http://127.0.0.1:4000/health/live', 'Backend health'),
    checkUrl('http://127.0.0.1:5173/health', 'Admin'),
    checkUrl('http://127.0.0.1:5174/health', 'Web public'),
    checkUrl('http://127.0.0.1:8081/health', 'Mobile customer'),
    checkUrl('http://127.0.0.1:8082/health', 'Mobile DSA'),
    checkUrl('http://127.0.0.1:8080/gateway-health', 'Nginx gateway'),
  ]);

  if (checks.every(Boolean)) {
    console.log('\n✅ All health checks passed');
    process.exit(0);
  }
  console.error('\n❌ Some health checks failed — run: docker compose logs -f');
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
