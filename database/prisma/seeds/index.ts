import { PrismaClient } from '@prisma/client';

import { seedMasterData } from './master.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding KuberOne master data (no demo transactions)...');
  await seedMasterData(prisma);
  console.log('✅ Master seed completed');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
