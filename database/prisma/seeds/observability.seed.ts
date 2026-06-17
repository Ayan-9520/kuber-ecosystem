import type { PrismaClient } from '@prisma/client';

const RETENTION_POLICIES = [
  { code: 'APP_LOGS', name: 'Application Logs', retentionType: 'APPLICATION', retentionDays: 30 },
  { code: 'AUDIT_LOGS', name: 'Audit Logs', retentionType: 'AUDIT', retentionDays: 365 },
  { code: 'SECURITY_LOGS', name: 'Security Logs', retentionType: 'SECURITY', retentionDays: 730 },
  { code: 'AI_LOGS', name: 'AI Logs', retentionType: 'AI', retentionDays: 90 },
  { code: 'SYSTEM_LOGS', name: 'System Logs', retentionType: 'SYSTEM', retentionDays: 14 },
] as const;

export async function seedObservability(prisma: PrismaClient): Promise<void> {
  for (const policy of RETENTION_POLICIES) {
    await prisma.observabilityRetentionPolicy.upsert({
      where: { code: policy.code },
      update: {
        name: policy.name,
        retentionType: policy.retentionType as never,
        retentionDays: policy.retentionDays,
        isActive: true,
        description: `${policy.name} retention policy`,
      },
      create: {
        code: policy.code,
        name: policy.name,
        retentionType: policy.retentionType as never,
        retentionDays: policy.retentionDays,
        isActive: true,
        description: `${policy.name} retention policy`,
      },
    });
  }

  console.log(`  → observability retention policies seeded (${RETENTION_POLICIES.length} policies)`);
}
