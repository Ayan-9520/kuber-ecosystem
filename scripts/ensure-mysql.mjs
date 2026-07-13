#!/usr/bin/env node
/** Ensure MySQL is reachable before starting the API on the host. */
import { execSync, spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import net from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MYSQL_PORTS = [3306, 3307];

function isMysqlReachable(port, timeoutMs = 2000) {
  return new Promise((resolveReachable) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
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

async function findReachableMysqlPort() {
  for (const port of MYSQL_PORTS) {
    if (await isMysqlReachable(port)) return port;
  }
  return null;
}

async function waitForMysql(maxWaitMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    const port = await findReachableMysqlPort();
    if (port) return port;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
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

  console.log('MySQL not running — starting Docker mysql + redis (docker compose)...');
  try {
    execSync('docker compose up -d mysql redis', { cwd: root, stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const existing = await findReachableMysqlPort();
  if (existing) {
    console.log(`✅ MySQL ready at 127.0.0.1:${existing}`);
    return;
  }

  tryStartWindowsService() || tryStartLocalMariaDb() || tryStartDockerMysql();

  const port = await waitForMysql();
  if (!port) {
    console.error('\n❌ MySQL is not reachable at 127.0.0.1:3306 or :3307');
    console.error('   Fix options:');
    console.error('   1. Start MariaDB/MySQL service (Services app)');
    console.error('   2. pnpm db:docker   (Docker — MySQL on :3307 + Redis on :6380)');
    console.error('   3. winget install MariaDB.Server   (then restart terminal)');
    console.error('   Then run once: pnpm db:setup\n');
    process.exit(1);
  }

  console.log(`✅ MySQL ready at 127.0.0.1:${port}`);
}

await main();
