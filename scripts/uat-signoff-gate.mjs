#!/usr/bin/env node
/**
 * KuberOne Final UAT Signoff gate — validates framework infrastructure before go-live authorization.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const required = [
  'deployment/uat/UAT_SIGNOFF_FRAMEWORK.md',
  'deployment/uat/APPROVAL_WORKFLOW.md',
  'database/prisma/schema/uat-final-signoff.prisma',
  'database/prisma/schema/migrations/20260612300000_add_uat_final_signoff/migration.sql',
  'apps/backend/src/modules/uat/services/uat-final-signoff.service.ts',
  'apps/backend/src/modules/uat/constants/uat-final-signoff.constants.ts',
  'apps/admin/src/features/uat/pages/UatHubPage.tsx',
  'database/prisma/seeds/uat-final-signoff.seed.ts',
  '.github/workflows/uat-signoff-validation.yml',
];

for (const f of required) {
  if (!existsSync(join(root, f))) failures.push(`Missing: ${f}`);
}

const auditReport = join(root, 'docs/ENTERPRISE_AUDIT_REPORT.md');
if (!existsSync(auditReport)) {
  failures.push('Production readiness audit report missing (docs/ENTERPRISE_AUDIT_REPORT.md)');
}

const goLiveFramework = join(root, 'deployment/go-live/GO_LIVE_FRAMEWORK.md');
if (!existsSync(goLiveFramework)) {
  failures.push('Go-Live framework missing — required for UAT signoff quality gate');
}

if (failures.length) {
  console.error('❌ UAT Signoff gate BLOCKED:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log('✅ UAT Signoff gate PASSED — framework infrastructure validated');
