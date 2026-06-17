#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaDir = join(root, 'database', 'prisma', 'schema');
const migrationsDir = join(schemaDir, 'migrations');

console.log('==> Validating Prisma schema');
execSync('pnpm --filter @kuberone/database exec prisma validate', { cwd: root, stdio: 'inherit' });

const failures = [];
const dangerous = /\b(DROP\s+TABLE|DROP\s+COLUMN|TRUNCATE)\b/i;

if (existsSync(migrationsDir)) {
  for (const entry of readdirSync(migrationsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const sqlPath = join(migrationsDir, entry.name, 'migration.sql');
    if (!existsSync(sqlPath)) continue;
    const sql = readFileSync(sqlPath, 'utf8');
    if (dangerous.test(sql) && process.env.ALLOW_DESTRUCTIVE_MIGRATIONS !== 'true') {
      failures.push(`Destructive migration detected: ${entry.name} (set ALLOW_DESTRUCTIVE_MIGRATIONS=true to override)`);
    }
  }
}

if (failures.length) {
  console.error('Prisma migration gate FAILED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('Prisma migration gate PASSED');
console.log('Database rollback guidance: restore from latest backup before applying down migrations; use pnpm db:migrate:deploy only in CI/CD with pre-deploy backup.');
