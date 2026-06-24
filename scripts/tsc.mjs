#!/usr/bin/env node
/** Run root TypeScript compiler (hoisted pnpm monorepo-safe). */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tsc = resolve(root, 'node_modules/typescript/bin/tsc');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [tsc, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});

process.exit(result.status ?? 1);
