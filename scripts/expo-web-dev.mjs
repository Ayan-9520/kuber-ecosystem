#!/usr/bin/env node
/** Expo web dev — EXPO_OFFLINE skips Expo API version check (Node 24 undici crash). */
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = process.argv[2] ?? '8081';
const extraArgs = process.argv.slice(3);

delete process.env.CI;
process.env.EXPO_OFFLINE = '1';

function resolveExpoCli() {
  const candidates = [
    resolve(process.cwd(), 'node_modules', '@expo', 'cli', 'build', 'bin', 'cli'),
    resolve(root, 'node_modules', '@expo', 'cli', 'build', 'bin', 'cli'),
    resolve(root, 'node_modules', '.bin', 'expo'),
  ];
  return candidates.find((p) => existsSync(p)) ?? 'expo';
}

const expoCli = resolveExpoCli();
const args = ['start', '--web', '--port', port, ...extraArgs];
const child = spawn(process.execPath, [expoCli, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 1));
