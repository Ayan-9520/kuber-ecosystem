import type { PrismaClient } from '@prisma/client';

const RETENTION_POLICIES = [
  { code: 'HOURLY', name: 'Hourly Backups', schedule: 'HOURLY', retentionHours: 48 },
  { code: 'DAILY', name: 'Daily Backups', schedule: 'DAILY', retentionHours: 720 },
  { code: 'WEEKLY', name: 'Weekly Backups', schedule: 'WEEKLY', retentionHours: 2016 },
  { code: 'MONTHLY', name: 'Monthly Backups', schedule: 'MONTHLY', retentionHours: 8760 },
] as const;

const BACKUP_JOBS = [
  { code: 'DB_HOURLY', name: 'Database Hourly Backup', scope: 'DATABASE', backupType: 'INCREMENTAL', schedule: 'HOURLY', retentionCode: 'HOURLY' },
  { code: 'DB_DAILY', name: 'Database Daily Full Backup', scope: 'DATABASE', backupType: 'FULL', schedule: 'DAILY', retentionCode: 'DAILY' },
  { code: 'DB_WEEKLY', name: 'Database Weekly Backup', scope: 'DATABASE', backupType: 'FULL', schedule: 'WEEKLY', retentionCode: 'WEEKLY' },
  { code: 'DB_MONTHLY', name: 'Database Monthly Backup', scope: 'DATABASE', backupType: 'FULL', schedule: 'MONTHLY', retentionCode: 'MONTHLY' },
  { code: 'DOCS_DAILY', name: 'Documents Daily Backup', scope: 'DOCUMENTS', backupType: 'INCREMENTAL', schedule: 'DAILY', retentionCode: 'DAILY' },
  { code: 'AI_WEEKLY', name: 'AI Knowledge Weekly Backup', scope: 'AI_KNOWLEDGE', backupType: 'FULL', schedule: 'WEEKLY', retentionCode: 'WEEKLY' },
  { code: 'CONFIG_DAILY', name: 'Configuration Daily Backup', scope: 'CONFIGURATION', backupType: 'FULL', schedule: 'DAILY', retentionCode: 'DAILY' },
  { code: 'LOGS_DAILY', name: 'Logs Daily Archive', scope: 'LOGS', backupType: 'INCREMENTAL', schedule: 'DAILY', retentionCode: 'DAILY' },
] as const;

const DR_PLANS = [
  { code: 'DR_DB_FAILURE', name: 'Database Failure Recovery', scenario: 'DATABASE_FAILURE', rpoMinutes: 15, rtoMinutes: 60 },
  { code: 'DR_APP_FAILURE', name: 'Application Failure Recovery', scenario: 'APPLICATION_FAILURE', rpoMinutes: 15, rtoMinutes: 45 },
  { code: 'DR_STORAGE_FAILURE', name: 'S3 Storage Failure Recovery', scenario: 'STORAGE_FAILURE', rpoMinutes: 15, rtoMinutes: 90 },
  { code: 'DR_REGION_FAILURE', name: 'Region Failure Recovery', scenario: 'REGION_FAILURE', rpoMinutes: 15, rtoMinutes: 240 },
  { code: 'DR_RANSOMWARE', name: 'Ransomware Incident Response', scenario: 'RANSOMWARE', rpoMinutes: 15, rtoMinutes: 120 },
  { code: 'DR_ACCIDENTAL_DELETE', name: 'Accidental Deletion Recovery', scenario: 'ACCIDENTAL_DELETION', rpoMinutes: 15, rtoMinutes: 30 },
  { code: 'DR_SECURITY', name: 'Security Incident Recovery', scenario: 'SECURITY_INCIDENT', rpoMinutes: 15, rtoMinutes: 180 },
  { code: 'DR_CLOUD_FAILURE', name: 'Cloud Provider Failure', scenario: 'CLOUD_FAILURE', rpoMinutes: 15, rtoMinutes: 240 },
] as const;

export async function seedBackup(prisma: PrismaClient): Promise<void> {
  for (const policy of RETENTION_POLICIES) {
    await prisma.backupRetention.upsert({
      where: { code: policy.code },
      update: { name: policy.name, schedule: policy.schedule as never, retentionHours: policy.retentionHours, isActive: true },
      create: { code: policy.code, name: policy.name, schedule: policy.schedule as never, retentionHours: policy.retentionHours, isActive: true },
    });
  }

  for (const job of BACKUP_JOBS) {
    await prisma.backupJob.upsert({
      where: { code: job.code },
      update: {
        name: job.name,
        scope: job.scope as never,
        backupType: job.backupType as never,
        schedule: job.schedule as never,
        retentionCode: job.retentionCode,
        status: 'ACTIVE',
        isEncrypted: true,
      },
      create: {
        code: job.code,
        name: job.name,
        scope: job.scope as never,
        backupType: job.backupType as never,
        schedule: job.schedule as never,
        retentionCode: job.retentionCode,
        status: 'ACTIVE',
        isEncrypted: true,
      },
    });
  }

  for (const plan of DR_PLANS) {
    await prisma.disasterRecoveryPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        scenario: plan.scenario as never,
        rpoMinutes: plan.rpoMinutes,
        rtoMinutes: plan.rtoMinutes,
        isActive: true,
        playbook: {
          steps: ['Declare incident', 'Assess scope', 'Execute restore', 'Validate integrity', 'Resume operations', 'Post-incident review'],
          contacts: ['DevOps Lead', 'CTO', 'Compliance Officer'],
        },
      },
      create: {
        code: plan.code,
        name: plan.name,
        scenario: plan.scenario as never,
        description: `${plan.name} — enterprise DR playbook for KuberOne`,
        rpoMinutes: plan.rpoMinutes,
        rtoMinutes: plan.rtoMinutes,
        isActive: true,
        playbook: {
          steps: ['Declare incident', 'Assess scope', 'Execute restore', 'Validate integrity', 'Resume operations', 'Post-incident review'],
          contacts: ['DevOps Lead', 'CTO', 'Compliance Officer'],
        },
      },
    });
  }

  console.log(`  → backup & DR seeded (${BACKUP_JOBS.length} jobs, ${DR_PLANS.length} DR plans)`);
}
