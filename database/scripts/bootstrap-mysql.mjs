/**
 * One-time local MySQL bootstrap. Run from repo root:
 *   node database/scripts/bootstrap-mysql.mjs
 *
 * Uses root credentials from ROOT_DATABASE_URL or defaults to root with no password.
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT_URL =
  process.env.ROOT_DATABASE_URL ?? 'mysql://root:@127.0.0.1:3306/mysql';

function parseUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, '') || undefined,
  };
}

async function main() {
  const cfg = parseUrl(ROOT_URL);
  const conn = await createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    multipleStatements: true,
  });

  const sql = readFileSync(join(__dirname, 'create-database.sql'), 'utf8');
  await conn.query(sql);
  await conn.end();
  console.log('✅ Database kuberone_dev and user kuberone created');
}

main().catch((err) => {
  console.error('❌ Bootstrap failed:', err.message);
  process.exit(1);
});
