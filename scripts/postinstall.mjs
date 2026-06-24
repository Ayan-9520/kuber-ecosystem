#!/usr/bin/env node
/** Generate Prisma client; do not fail install if backend holds the engine DLL. */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const result = spawnSync('pnpm', ['db:generate'], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
});

if (result.status !== 0) {
  console.warn(
    '\n[postinstall] Prisma generate skipped (stop backend if running, then: pnpm db:generate)\n',
  );
}

process.exit(0);
