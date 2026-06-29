#!/usr/bin/env node
/** Expo web dev — EXPO_OFFLINE skips Expo API version check (Node 24 undici crash). */
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = process.argv[2] ?? '8081';
const extraArgs = process.argv.slice(3);

delete process.env.CI;
process.env.EXPO_OFFLINE = '1';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

for (const name of ['.env', '.env.local', '.env.development']) {
  loadEnvFile(resolve(process.cwd(), name));
}

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
