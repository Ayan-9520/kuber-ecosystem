import { PrismaClient } from '@prisma/client';

import { seedDevAccounts } from './dev-accounts.seed.js';
import { seedMasterData } from './master.seed.js';
import { seedOpsHub } from './ops-hub.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding KuberOne (master + dev login accounts)...');
  await seedMasterData(prisma);
  await seedDevAccounts(prisma);
  await seedOpsHub(prisma);
  console.log('✅ Dev seed completed');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Dev seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
