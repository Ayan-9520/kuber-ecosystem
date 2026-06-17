import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const row = await prisma.auditEvent.create({
    data: {
      traceId: 'test-trace',
      source: 'AUTH',
      action: 'UPDATE',
      entityType: 'otp_verification',
      integrityHash: 'abc123',
    },
  });
  console.log('auditEvent ok', row.id);
} catch (e) {
  console.error('ERROR:', e.code, e.message);
} finally {
  await prisma.$disconnect();
}
