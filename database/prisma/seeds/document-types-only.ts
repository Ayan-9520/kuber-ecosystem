import { PrismaClient } from '@prisma/client';

import { seedDocumentTypes } from './document-types.seed.js';

const prisma = new PrismaClient();

seedDocumentTypes(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
