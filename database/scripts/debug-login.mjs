import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findFirst({ where: { email: 'admin@kuberone.com' } });
  console.log('user', user?.id, user?.userType, user?.status, !!user?.passwordHash);
  if (!user) throw new Error('admin user missing');

  const valid = await bcrypt.compare('Admin@123', user.passwordHash);
  console.log('password valid', valid);

  const roles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });
  console.log('roles', roles.map((r) => r.role.code));

  const emp = await prisma.employee.findUnique({
    where: { userId: user.id },
    include: { branch: { include: { region: true } } },
  });
  console.log('employee', emp?.id, emp?.branch?.name, emp?.branch?.regionId);

  const session = await prisma.session.create({
    data: { userId: user.id, expiresAt: new Date(Date.now() + 86400000) },
  });
  console.log('session ok', session.id);
  await prisma.session.delete({ where: { id: session.id } });

  const history = await prisma.loginHistory.create({
    data: { userId: user.id, success: true, ipAddress: '127.0.0.1' },
  });
  console.log('login history ok', history.id);
  await prisma.loginHistory.delete({ where: { id: history.id } });
} catch (e) {
  console.error('FAIL', e);
} finally {
  await prisma.$disconnect();
}
