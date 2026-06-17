#!/usr/bin/env node
/**
 * Go-Live gate — blocks production deploy if critical conditions fail
 */
import { execSync } from 'node:child_process';

import { loadDatabase } from './lib/database-client.mjs';

const failures = [];

async function main() {
  const { prisma, disconnectDatabase } = await loadDatabase();

  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - 24);
    const maxCritical = Number(process.env.ERROR_GATE_MAX_CRITICAL ?? 5);

    const [criticalErrors, uatSignoffs, backupJobs] = await Promise.all([
      prisma.errorGroup.count({
        where: {
          priority: 'CRITICAL',
          status: { notIn: ['RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED'] },
          lastSeenAt: { gte: windowStart },
        },
      }),
      prisma.uatSignoff.count({ where: { status: 'APPROVED', signedAt: { gte: windowStart } } }),
      prisma.backupJob.count({ where: { status: 'ACTIVE' } }),
    ]);

    if (criticalErrors > maxCritical) {
      failures.push(`Critical bugs: ${criticalErrors} unresolved (max ${maxCritical})`);
    }

    if (uatSignoffs === 0) {
      failures.push('UAT not signed off in last 24h');
    }

    if (backupJobs < 1) {
      failures.push('No active backup jobs configured');
    }

    try {
      execSync('node scripts/security-quality-gate.mjs', { stdio: 'pipe' });
    } catch {
      failures.push('Critical security findings exist');
    }

    try {
      execSync('node scripts/prisma-migration-gate.mjs', { stdio: 'pipe' });
    } catch {
      failures.push('Production validation failed (migrations)');
    }

    if (failures.length) {
      console.error('❌ Go-Live gate BLOCKED:');
      failures.forEach((f) => console.error(' -', f));
      process.exit(1);
    }

    console.log('✅ Go-Live gate PASSED');
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
