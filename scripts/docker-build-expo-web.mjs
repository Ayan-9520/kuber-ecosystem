#!/usr/bin/env node
/** Production Expo web export for Docker (mobile-customer / mobile-dsa). */
import { existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cwd = process.cwd();

process.env.EXPO_OFFLINE = '1';

const pinnedAppEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'production';
const pinnedApiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? '/api/v1';

// Expo loads .env.production when NODE_ENV=production; pin Docker/local values first.
process.env.NODE_ENV = 'production';
process.env.EXPO_PUBLIC_APP_ENV = pinnedAppEnv;
process.env.EXPO_PUBLIC_API_BASE_URL = pinnedApiBase;

const prodEnvPath = resolve(cwd, '.env.production');
if (existsSync(prodEnvPath)) {
  writeFileSync(
    prodEnvPath,
    `EXPO_PUBLIC_APP_ENV=${pinnedAppEnv}\nEXPO_PUBLIC_API_BASE_URL=${pinnedApiBase}\n`,
  );
}

function resolveExpoCli() {
  const candidates = [
    resolve(cwd, 'node_modules', '@expo', 'cli', 'build', 'bin', 'cli'),
    resolve(root, 'node_modules', '@expo', 'cli', 'build', 'bin', 'cli'),
    resolve(root, 'node_modules', '.bin', 'expo'),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

const expoCli = resolveExpoCli();
if (!expoCli) {
  console.error('Expo CLI not found. Run pnpm install from the repository root.');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [expoCli, 'export', '--platform', 'web', '--output-dir', 'dist'],
  { stdio: 'inherit', cwd, env: process.env },
);

process.exit(result.status ?? 1);
