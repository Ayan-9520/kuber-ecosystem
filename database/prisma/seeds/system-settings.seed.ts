import type { PrismaClient } from '@prisma/client';

const SETTINGS = [
  {
    key: 'lead.grading.enabled',
    value: true,
    category: 'lead',
  },
  {
    key: 'lead.scoring.weights',
    value: { rules: 0.7, ai: 0.3 },
    category: 'lead',
  },
  {
    key: 'app.maintenance_mode',
    value: false,
    category: 'system',
  },
  {
    key: 'otp.expiry_seconds',
    value: 300,
    category: 'auth',
  },
];

export async function seedSystemSettings(prisma: PrismaClient): Promise<void> {
  for (const setting of SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, category: setting.category },
      create: setting,
    });
  }
  console.log('  → system_settings seeded');
}
