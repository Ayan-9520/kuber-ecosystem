#!/usr/bin/env node
/** Quick seed for mobile app test login — no full seed required */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CUSTOMERS = [
  { phone: '9876543210', code: 'CUST-DEMO-001', firstName: 'Demo', lastName: 'Customer' },
  { phone: '9520776129', code: 'CUST-DEMO-002', firstName: 'Test', lastName: 'User' },
];

async function main() {
  let role = await prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
  if (!role) {
    role = await prisma.role.create({
      data: { code: 'CUSTOMER', name: 'Customer', description: 'Customer mobile app user', isSystem: true },
    });
    console.log('  → created CUSTOMER role');
  }

  for (const c of CUSTOMERS) {
    const user = await prisma.user.upsert({
      where: { phone: c.phone },
      update: { userType: 'CUSTOMER', status: 'ACTIVE', phoneVerified: true },
      create: { phone: c.phone, userType: 'CUSTOMER', status: 'ACTIVE', phoneVerified: true },
    });

    const hasRole = await prisma.userRole.findFirst({ where: { userId: user.id, roleId: role.id } });
    if (!hasRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: role.id, isPrimary: true } });
    }

    await prisma.customer.upsert({
      where: { userId: user.id },
      update: { firstName: c.firstName, lastName: c.lastName, fullName: `${c.firstName} ${c.lastName}` },
      create: {
        userId: user.id,
        customerCode: c.code,
        firstName: c.firstName,
        lastName: c.lastName,
        fullName: `${c.firstName} ${c.lastName}`,
      },
    });

    console.log(`✅ Customer ready: ${c.phone} (dev OTP: 123456)`);
  }
}

main()
  .catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
