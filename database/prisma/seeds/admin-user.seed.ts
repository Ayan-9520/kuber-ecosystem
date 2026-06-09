import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@kuberone.com';
const ADMIN_PHONE = '9999999999';
const ADMIN_PASSWORD = 'Admin@123';

export async function seedAdminUser(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role not found — run roles seed first');
  }

  const region = await prisma.region.upsert({
    where: { code: 'HQ-REG' },
    update: { name: 'Head Office Region', isActive: true },
    create: { code: 'HQ-REG', name: 'Head Office Region' },
  });

  const branch = await prisma.branch.upsert({
    where: { code: 'HQ-001' },
    update: { name: 'Head Office', regionId: region.id, isActive: true },
    create: {
      code: 'HQ-001',
      name: 'Head Office',
      regionId: region.id,
      city: 'Mumbai',
      state: 'Maharashtra',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      phone: ADMIN_PHONE,
      passwordHash,
      userType: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      passwordHash,
      userType: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const existingUserRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: superAdminRole.id },
  });

  if (existingUserRole) {
    await prisma.userRole.update({
      where: { id: existingUserRole.id },
      data: { isPrimary: true, branchId: branch.id, regionId: region.id },
    });
  } else {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,
        branchId: branch.id,
        regionId: region.id,
        isPrimary: true,
      },
    });
  }

  await prisma.employee.upsert({
    where: { userId: user.id },
    update: {
      branchId: branch.id,
      firstName: 'Super',
      lastName: 'Admin',
      designation: 'Super Administrator',
      isActive: true,
    },
    create: {
      userId: user.id,
      branchId: branch.id,
      employeeCode: 'EMP-000001',
      firstName: 'Super',
      lastName: 'Admin',
      designation: 'Super Administrator',
      isActive: true,
    },
  });

  console.log('  → admin user seeded (admin@kuberone.com / Admin@123)');
}
