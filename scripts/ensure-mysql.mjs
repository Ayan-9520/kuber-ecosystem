#!/usr/bin/env node
/** Ensure MySQL/MariaDB is reachable on 127.0.0.1:3306 before starting the API. */
import { execSync, spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import net from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const composeFile = resolve(root, 'docker/docker-compose.dev.yml');

function isMysqlReachable(timeoutMs = 2000) {
  return new Promise((resolveReachable) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: 3306 });
    const done = (ok) => {
      socket.destroy();
      resolveReachable(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}

async function waitForMysql(maxWaitMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    if (await isMysqlReachable()) return true;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

function findLocalMariaDb() {
  const programFiles = process.env['ProgramFiles'] ?? 'C:\\Program Files';
  try {
    for (const entry of readdirSync(programFiles)) {
      const match = entry.match(/^MariaDB (\d+(?:\.\d+)?)$/i);
      if (!match) continue;
      const base = resolve(programFiles, entry);
      const mysqld = resolve(base, 'bin/mysqld.exe');
      const defaults = resolve(base, 'data/my.ini');
      if (existsSync(mysqld) && existsSync(defaults)) {
        return { mysqld, defaults };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function tryStartWindowsService() {
  const names = ['MariaDB', 'MySQL', 'MySQL80', 'MYSQL80'];
  for (const name of names) {
    try {
      const status = execSync(`sc.exe query ${name}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      if (!/RUNNING/i.test(status)) {
        execSync(`net start ${name}`, { stdio: 'ignore' });
      }
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

function tryStartLocalMariaDb() {
  const install = findLocalMariaDb();
  if (!install) return false;

  console.log(`MySQL not running — starting local MariaDB (${install.mysqld})...`);
  try {
    const child = spawn(install.mysqld, [`--defaults-file=${install.defaults}`], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function tryStartDockerMysql() {
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch {
    return false;
  }

  console.log('MySQL not running — starting Docker container (kuberone-dev-mysql)...');
  try {
    execSync(`docker compose -f "${composeFile}" up -d`, { cwd: root, stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await isMysqlReachable()) return;

  tryStartWindowsService() || tryStartLocalMariaDb() || tryStartDockerMysql();

  if (!(await waitForMysql())) {
    console.error('\n❌ MySQL is not reachable at 127.0.0.1:3306');
    console.error('   Fix options:');
    console.error('   1. Start MariaDB/MySQL service (Services app)');
    console.error('   2. pnpm db:docker   (requires Docker Desktop)');
    console.error('   3. winget install MariaDB.Server   (then restart terminal)');
    console.error('   Then run once: pnpm db:setup\n');
    process.exit(1);
  }

  console.log('✅ MySQL ready at 127.0.0.1:3306');
}

await main();
