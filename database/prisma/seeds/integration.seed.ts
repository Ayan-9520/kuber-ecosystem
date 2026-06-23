import { PrismaClient } from '@prisma/client';

import { seedIntegrationFixtures } from './integration-fixtures.seed.js';
import { seedMasterData } from './master.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding integration database (master + test fixtures)...');
  await seedMasterData(prisma);
  await seedIntegrationFixtures(prisma);
  console.log('✅ Integration seed completed');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Integration seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
