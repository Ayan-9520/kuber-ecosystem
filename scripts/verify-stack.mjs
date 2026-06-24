#!/usr/bin/env node
/**
 * Quick health check for local dev stack (admin, backend, mobile, database).
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(label, command, args, cwd = root) {
  process.stdout.write(`\n▶ ${label}... `);
  const result = spawnSync(command, args, {
    cwd,
    shell: process.platform === 'win32' && command === 'pnpm',
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (result.status === 0) {
    console.log('OK');
    return true;
  }
  console.log('FAIL');
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return false;
}

const checks = [
  run('Prisma client', 'node', ['-e', "require('@prisma/client')"], root) ||
    existsSync(resolve(root, 'node_modules/.prisma/client/index.js')),
  run('Typecheck admin', 'pnpm', ['--filter', '@kuberone/admin', 'typecheck']),
  run('Typecheck backend', 'pnpm', ['--filter', '@kuberone/backend', 'typecheck']),
  run('Typecheck mobile-customer', 'pnpm', ['--filter', '@kuberone/mobile-customer', 'typecheck']),
  run('Typecheck mobile-dsa', 'pnpm', ['--filter', '@kuberone/mobile-dsa', 'typecheck']),
  run('Typecheck database', 'pnpm', ['--filter', '@kuberone/database', 'typecheck']),
  run('Build admin', 'pnpm', ['--filter', '@kuberone/admin', 'build']),
];

const passed = checks.filter(Boolean).length;
const total = checks.length;

console.log(`\n${passed}/${total} checks passed.`);

if (passed < total) {
  console.log('\nTips:');
  console.log('- Stop backend before pnpm db:generate if EPERM on Prisma DLL');
  console.log('- Backend: pnpm dev:backend | Admin: pnpm dev:admin | Mobile web: pnpm dev:mobile-customer');
  process.exit(1);
}

console.log('\nStack looks good. Start: pnpm dev:backend + pnpm dev:admin + pnpm dev:mobile-customer');
