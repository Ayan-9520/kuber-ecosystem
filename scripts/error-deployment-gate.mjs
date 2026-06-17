#!/usr/bin/env node
/**
 * CI/CD deployment gate — fails if critical unresolved errors exceed threshold.
 * Usage: node scripts/error-deployment-gate.mjs
 */
import { loadDatabase } from './lib/database-client.mjs';

const maxCritical = Number(process.env.ERROR_GATE_MAX_CRITICAL ?? 5);
const windowHours = Number(process.env.ERROR_GATE_WINDOW_HOURS ?? 24);

async function main() {
  const { prisma, disconnectDatabase } = await loadDatabase();

  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - windowHours);

    const criticalUnresolved = await prisma.errorGroup.count({
      where: {
        priority: 'CRITICAL',
        status: { notIn: ['RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED'] },
        lastSeenAt: { gte: windowStart },
      },
    });

    if (criticalUnresolved > maxCritical) {
      console.error(`❌ Deployment gate FAILED: ${criticalUnresolved} critical unresolved errors (max ${maxCritical})`);
      process.exit(1);
    }

    console.log(`✅ Deployment gate passed: ${criticalUnresolved} critical unresolved errors (max ${maxCritical})`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  console.error('Deployment gate check error:', err);
  process.exit(1);
});
