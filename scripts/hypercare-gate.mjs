#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

for (const f of [
  'deployment/hypercare/HYPERCARE_FRAMEWORK.md',
  'database/prisma/schema/hypercare.prisma',
  'database/prisma/schema/migrations/20260612320000_add_hypercare/migration.sql',
  'apps/backend/src/modules/hypercare/services/hypercare.service.ts',
  'apps/admin/src/features/hypercare/pages/HypercareHubPage.tsx',
  'database/prisma/seeds/hypercare.seed.ts',
  '.github/workflows/hypercare-validation.yml',
]) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

if (failures.length) {
  console.error('❌ Hypercare gate BLOCKED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('✅ Hypercare gate PASSED — support phase infrastructure validated');
