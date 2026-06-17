export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function buildDatasourceUrl(): string | undefined {
  const base = process.env.DATABASE_URL;
  if (!base) return undefined;
  if (/connection_limit=/.test(base)) return base;
  const limit = process.env.DATABASE_CONNECTION_LIMIT ?? '10';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}connection_limit=${limit}&pool_timeout=20`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: buildDatasourceUrl() ? { db: { url: buildDatasourceUrl() } } : undefined,
  });

globalForPrisma.prisma = prisma;

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
