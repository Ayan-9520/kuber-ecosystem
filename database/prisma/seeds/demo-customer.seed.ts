import type { PrismaClient } from '@prisma/client';

const DEMO_CUSTOMERS = [
  { phone: '9876543210', code: 'CUST-DEMO-001', firstName: 'Demo', lastName: 'Customer' },
  { phone: '9520776129', code: 'CUST-DEMO-002', firstName: 'Test', lastName: 'User' },
] as const;

async function upsertDemoCustomer(
  prisma: PrismaClient,
  customerRoleId: string,
  entry: (typeof DEMO_CUSTOMERS)[number],
): Promise<void> {
  const user = await prisma.user.upsert({
    where: { phone: entry.phone },
    update: {
      userType: 'CUSTOMER',
      status: 'ACTIVE',
      phoneVerified: true,
    },
    create: {
      phone: entry.phone,
      userType: 'CUSTOMER',
      status: 'ACTIVE',
      phoneVerified: true,
    },
  });

  const existingRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: customerRoleId },
  });
  if (!existingRole) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: customerRoleId, isPrimary: true },
    });
  }

  await prisma.customer.upsert({
    where: { userId: user.id },
    update: {
      firstName: entry.firstName,
      lastName: entry.lastName,
      fullName: `${entry.firstName} ${entry.lastName}`,
      kycStatus: 'NOT_STARTED',
    },
    create: {
      userId: user.id,
      customerCode: entry.code,
      firstName: entry.firstName,
      lastName: entry.lastName,
      fullName: `${entry.firstName} ${entry.lastName}`,
      kycStatus: 'NOT_STARTED',
    },
  });
}

export async function seedDemoCustomer(prisma: PrismaClient): Promise<void> {
  const customerRole = await prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
  if (!customerRole) {
    throw new Error('CUSTOMER role not found — run roles seed first');
  }

  for (const entry of DEMO_CUSTOMERS) {
    await upsertDemoCustomer(prisma, customerRole.id, entry);
    console.log(`  → demo customer seeded (${entry.phone}, OTP: 123456 in dev)`);
  }
}
