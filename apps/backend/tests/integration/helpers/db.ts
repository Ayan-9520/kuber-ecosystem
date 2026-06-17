import { disconnectDatabase, prisma } from '@kuberone/database';

export function getPrisma() {
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await disconnectDatabase();
}

export async function findSeedIds() {
  const client = getPrisma();
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const [product, leadSource, ticketCategory, branch, region, referralType, documentType] =
        await Promise.all([
          client.product.findFirst({ where: { code: 'HL-01' } }),
          client.leadSource.findFirst({ where: { code: 'DSA' } }),
          client.ticketCategory.findFirst({ where: { code: 'GENERAL_INQUIRY' } }),
          client.branch.findFirst({ where: { code: 'HQ-001' } }),
          client.region.findFirst({ where: { code: 'HQ-REG' } }),
          client.referralType.findFirst(),
          client.documentType.findFirst({ where: { code: 'PAN' } }),
        ]);

      if (!product || !leadSource || !ticketCategory || !branch || !region) {
        throw new Error('Integration seed data incomplete — run database seeds');
      }

      return {
        productId: product.id,
        leadSourceId: leadSource.id,
        ticketCategoryId: ticketCategory.id,
        branchId: branch.id,
        regionId: region.id,
        referralTypeId: referralType?.id,
        documentTypeId: documentType?.id,
      };
    } catch (error) {
      const retriable =
        error instanceof Error &&
        (error.message.includes("Can't reach database server") ||
          error.message.includes('Connection pool timeout'));
      if (!retriable || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  throw new Error('Integration seed lookup failed');
}

export async function getDemoCustomer() {
  const client = getPrisma();
  const user = await client.user.findFirst({ where: { phone: '9876543210' } });
  const customer = user
    ? await client.customer.findFirst({ where: { userId: user.id } })
    : null;
  if (!user || !customer) {
    throw new Error('Demo customer seed missing');
  }
  return { user, customer };
}
