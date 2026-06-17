import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { phone: '9520776129' } });
  console.log('user:', user?.id, user?.userType, user?.status);

  const otp = await prisma.otpVerification.create({
    data: {
      phone: '9520776129',
      otpHash: 'testhash',
      purpose: 'LOGIN',
      expiresAt: new Date(Date.now() + 300_000),
    },
  });
  console.log('otp created:', otp.id);

  const audit = await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action: 'OTP_SENT',
      entityType: 'otp_verification',
      newValues: { phone: '9520776129' },
    },
  });
  console.log('auditLog ok:', audit.id);
} catch (e) {
  console.error('ERROR:', e.code, e.message);
} finally {
  await prisma.$disconnect();
}
