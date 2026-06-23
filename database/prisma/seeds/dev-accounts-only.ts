import { PrismaClient } from '@prisma/client';

import { seedDevAccounts } from './dev-accounts.seed.js';

const prisma = new PrismaClient();

seedDevAccounts(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
