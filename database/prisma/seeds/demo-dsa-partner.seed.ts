import type { PrismaClient } from '@prisma/client';

/** Demo DSA partner for mobile-dsa OTP login (not the customer demo number). */
export const DEMO_DSA_PARTNER_PHONE = '8888777766';

export async function seedDemoDsaPartner(prisma: PrismaClient): Promise<void> {
  const dsaType = await prisma.partnerType.findUnique({ where: { code: 'DSA' } });
  if (!dsaType) {
    throw new Error('DSA partner type not found — run seedPartnerTypes first');
  }

  const role = await prisma.role.findUnique({ where: { code: 'DSA_PARTNER' } });
  if (!role) {
    throw new Error('DSA_PARTNER role not found — run seedRoles first');
  }

  const user = await prisma.user.upsert({
    where: { phone: DEMO_DSA_PARTNER_PHONE },
    update: {
      userType: 'PARTNER',
      status: 'ACTIVE',
      phoneVerified: true,
    },
    create: {
      phone: DEMO_DSA_PARTNER_PHONE,
      userType: 'PARTNER',
      status: 'ACTIVE',
      phoneVerified: true,
    },
  });

  const existingRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: role.id },
  });
  if (!existingRole) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id, isPrimary: true },
    });
  }

  const existingPartner = await prisma.partner.findFirst({
    where: { userId: user.id, deletedAt: null },
  });
  if (existingPartner) {
    await prisma.partner.update({
      where: { id: existingPartner.id },
      data: {
        partnerTypeId: dsaType.id,
        businessName: 'Demo DSA Agency',
        contactName: 'Demo DSA Partner',
        phone: DEMO_DSA_PARTNER_PHONE,
        email: 'dsa.demo@kuberone.com',
        kycStatus: 'VERIFIED',
        status: 'ACTIVE',
        commissionTier: 'STANDARD',
      },
    });
  } else {
    await prisma.partner.create({
      data: {
        userId: user.id,
        partnerTypeId: dsaType.id,
        partnerCode: 'DSA-DEMO-001',
        businessName: 'Demo DSA Agency',
        contactName: 'Demo DSA Partner',
        phone: DEMO_DSA_PARTNER_PHONE,
        email: 'dsa.demo@kuberone.com',
        kycStatus: 'VERIFIED',
        status: 'ACTIVE',
        commissionTier: 'STANDARD',
      },
    });
  }

  console.log(`  → demo DSA partner seeded (${DEMO_DSA_PARTNER_PHONE}, OTP: 123456 in dev)`);
}
