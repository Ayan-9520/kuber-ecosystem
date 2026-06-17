export const BACKUP_SCOPES = [
  'DATABASE', 'DOCUMENTS', 'MEDIA', 'AI_KNOWLEDGE', 'CONFIGURATION', 'LOGS', 'APPLICATION',
] as const;

export const BACKUP_RETENTION_DEFAULTS = [
  { code: 'HOURLY', name: 'Hourly Backups', schedule: 'HOURLY', retentionHours: 48 },
  { code: 'DAILY', name: 'Daily Backups', schedule: 'DAILY', retentionHours: 720 },
  { code: 'WEEKLY', name: 'Weekly Backups', schedule: 'WEEKLY', retentionHours: 2016 },
  { code: 'MONTHLY', name: 'Monthly Backups', schedule: 'MONTHLY', retentionHours: 8760 },
] as const;

export const BACKUP_JOB_DEFAULTS = [
  { code: 'DB_HOURLY', name: 'Database Hourly Backup', scope: 'DATABASE', backupType: 'INCREMENTAL', schedule: 'HOURLY', retentionCode: 'HOURLY' },
  { code: 'DB_DAILY', name: 'Database Daily Full Backup', scope: 'DATABASE', backupType: 'FULL', schedule: 'DAILY', retentionCode: 'DAILY' },
  { code: 'DB_WEEKLY', name: 'Database Weekly Backup', scope: 'DATABASE', backupType: 'FULL', schedule: 'WEEKLY', retentionCode: 'WEEKLY' },
  { code: 'DB_MONTHLY', name: 'Database Monthly Backup', scope: 'DATABASE', backupType: 'FULL', schedule: 'MONTHLY', retentionCode: 'MONTHLY' },
  { code: 'DOCS_DAILY', name: 'Documents Daily Backup', scope: 'DOCUMENTS', backupType: 'INCREMENTAL', schedule: 'DAILY', retentionCode: 'DAILY' },
  { code: 'AI_WEEKLY', name: 'AI Knowledge Weekly Backup', scope: 'AI_KNOWLEDGE', backupType: 'FULL', schedule: 'WEEKLY', retentionCode: 'WEEKLY' },
  { code: 'CONFIG_DAILY', name: 'Configuration Daily Backup', scope: 'CONFIGURATION', backupType: 'FULL', schedule: 'DAILY', retentionCode: 'DAILY' },
  { code: 'LOGS_DAILY', name: 'Logs Daily Archive', scope: 'LOGS', backupType: 'INCREMENTAL', schedule: 'DAILY', retentionCode: 'DAILY' },
] as const;

export const DR_PLAN_DEFAULTS = [
  { code: 'DR_DB_FAILURE', name: 'Database Failure Recovery', scenario: 'DATABASE_FAILURE', rpoMinutes: 15, rtoMinutes: 60 },
  { code: 'DR_APP_FAILURE', name: 'Application Failure Recovery', scenario: 'APPLICATION_FAILURE', rpoMinutes: 15, rtoMinutes: 45 },
  { code: 'DR_STORAGE_FAILURE', name: 'S3 Storage Failure Recovery', scenario: 'STORAGE_FAILURE', rpoMinutes: 15, rtoMinutes: 90 },
  { code: 'DR_REGION_FAILURE', name: 'Region Failure Recovery', scenario: 'REGION_FAILURE', rpoMinutes: 15, rtoMinutes: 240 },
  { code: 'DR_RANSOMWARE', name: 'Ransomware Incident Response', scenario: 'RANSOMWARE', rpoMinutes: 15, rtoMinutes: 120 },
  { code: 'DR_ACCIDENTAL_DELETE', name: 'Accidental Deletion Recovery', scenario: 'ACCIDENTAL_DELETION', rpoMinutes: 15, rtoMinutes: 30 },
  { code: 'DR_SECURITY', name: 'Security Incident Recovery', scenario: 'SECURITY_INCIDENT', rpoMinutes: 15, rtoMinutes: 180 },
  { code: 'DR_CLOUD_FAILURE', name: 'Cloud Provider Failure', scenario: 'CLOUD_FAILURE', rpoMinutes: 15, rtoMinutes: 240 },
] as const;

export const BACKUP_ALERT_RULES = [
  { code: 'BACKUP_FAILURE', name: 'Backup Job Failed', severity: 'CRITICAL' },
  { code: 'BACKUP_DELAY', name: 'Backup Delayed', severity: 'HIGH' },
  { code: 'RESTORE_FAILURE', name: 'Restore Failed', severity: 'CRITICAL' },
  { code: 'STORAGE_THRESHOLD', name: 'Backup Storage Threshold', severity: 'HIGH' },
  { code: 'REPLICATION_FAILURE', name: 'Cross-Region Replication Failed', severity: 'HIGH' },
] as const;

export const RPO_TARGET_MINUTES = 15;
export const RTO_TARGET_MINUTES = 60;
