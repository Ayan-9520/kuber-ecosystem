#!/usr/bin/env node
/** Free port before dev servers — avoids npx/npm reading pnpm-only .npmrc settings. */
import { execSync } from 'node:child_process';

const port = Number(process.argv[2]);
if (!Number.isFinite(port) || port <= 0) {
  console.error('Usage: node scripts/kill-dev-port.mjs <port>');
  process.exit(1);
}

function killOnWindows(p) {
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const pids = new Set();
    const needle = `:${p}`;
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes(needle) || !line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && pid !== '0') pids.add(pid);
    }
    if (pids.size === 0) return;
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      } catch {
        /* process already exited */
      }
    }
    console.log(`Process on port ${p} killed`);
  } catch {
    /* nothing listening */
  }
}

function killOnUnix(p) {
  try {
    const pids = execSync(`lsof -ti tcp:${p}`, { encoding: 'utf8' }).trim();
    if (!pids) return;
    for (const pid of pids.split(/\s+/)) {
      try {
        process.kill(Number(pid), 'SIGKILL');
      } catch {
        /* process already exited */
      }
    }
    console.log(`Process on port ${p} killed`);
  } catch {
    /* nothing listening */
  }
}

if (process.platform === 'win32') killOnWindows(port);
else killOnUnix(port);
