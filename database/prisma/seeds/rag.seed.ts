import type { PrismaClient } from '@prisma/client';

export async function seedRag(prisma: PrismaClient): Promise<void> {
  await prisma.vectorIndex.upsert({
    where: { name_provider: { name: 'kuberone-main', provider: 'LOCAL' } },
    update: { isActive: true },
    create: {
      name: 'kuberone-main',
      provider: 'LOCAL',
      dimensions: 384,
      isActive: true,
      config: { description: 'Default local vector index for development' },
    },
  });

  console.log('  → RAG vector index seeded');
}
