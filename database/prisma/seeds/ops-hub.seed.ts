import type { PrismaClient } from '@prisma/client';

import { seedGoLive } from './go-live.seed.js';
import { seedHypercare } from './hypercare.seed.js';
import { seedProduction } from './production.seed.js';
import { seedStaging } from './staging.seed.js';
import { seedUat } from './uat.seed.js';
import { seedUatFinalSignoff } from './uat-final-signoff.seed.js';

/** Staging, production, UAT, go-live, and hypercare reference data for admin ops hubs. */
export async function seedOpsHub(prisma: PrismaClient): Promise<void> {
  await seedStaging(prisma);
  await seedProduction(prisma);
  await seedUat(prisma);
  await seedUatFinalSignoff(prisma);
  await seedGoLive(prisma);
  await seedHypercare(prisma);
  console.log('  ✓ Ops hub modules seeded (staging, production, UAT, go-live, hypercare)');
}

async function main(): Promise<void> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    await seedOpsHub(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('ops-hub.seed.ts')) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
