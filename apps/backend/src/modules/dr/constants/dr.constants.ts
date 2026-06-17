export const DR_PERMISSIONS = {
  READ: 'dr.read',
  MANAGE: 'dr.manage',
  EXECUTE: 'dr.execute',
  RECOVERY_MANAGE: 'recovery.manage',
} as const;

export const RPO_TARGET_MINUTES = 15;
export const RTO_TARGET_MINUTES = 60;

export const DISASTER_SCENARIOS = [
  { code: 'DATABASE_FAILURE', name: 'Database Failure', rto: 60 },
  { code: 'APPLICATION_FAILURE', name: 'Application Failure', rto: 45 },
  { code: 'SERVER_FAILURE', name: 'Server Failure', rto: 60 },
  { code: 'LOAD_BALANCER_FAILURE', name: 'Load Balancer Failure', rto: 30 },
  { code: 'REDIS_FAILURE', name: 'Redis Failure', rto: 30 },
  { code: 'STORAGE_FAILURE', name: 'Storage Failure', rto: 90 },
  { code: 'AI_SERVICE_FAILURE', name: 'AI Service Failure', rto: 45 },
  { code: 'NOTIFICATION_PROVIDER_FAILURE', name: 'Notification Provider Failure', rto: 30 },
  { code: 'REGION_FAILURE', name: 'Region Failure', rto: 240 },
  { code: 'CLOUD_FAILURE', name: 'Cloud Provider Failure', rto: 240 },
  { code: 'SECURITY_INCIDENT', name: 'Security Incident', rto: 180 },
  { code: 'CREDENTIAL_LEAK', name: 'Credential Leak', rto: 120 },
  { code: 'RANSOMWARE', name: 'Ransomware Attack', rto: 120 },
  { code: 'ACCIDENTAL_DELETION', name: 'Accidental Data Deletion', rto: 30 },
  { code: 'FAILED_PRODUCTION_DEPLOYMENT', name: 'Failed Production Deployment', rto: 45 },
] as const;

export const DR_DRILL_SCHEDULE = [
  { type: 'MONTHLY', label: 'Monthly DR Drill', frequency: 'Every month' },
  { type: 'QUARTERLY', label: 'Quarterly DR Simulation', frequency: 'Every quarter' },
  { type: 'ANNUAL', label: 'Annual Full Recovery Test', frequency: 'Every year' },
] as const;

export const FAILOVER_STRATEGY = {
  primary: 'production-ap-south-1',
  standby: 'standby-ap-south-2',
  dnsFailoverReady: true,
  trafficSwitching: ['ALB', 'Route53', 'Cloudflare'],
  strategies: ['DNS failover', 'Traffic switch', 'Blue-green', 'Read replica promotion'],
} as const;

export const DR_QUALITY_GATES = [
  { id: 'backups_valid', label: 'Backups validated', weight: 20 },
  { id: 'restore_tested', label: 'Restore capability tested', weight: 20 },
  { id: 'rpo_met', label: 'RPO < 15 min', weight: 20 },
  { id: 'rto_met', label: 'RTO < 60 min', weight: 20 },
  { id: 'drill_passed', label: 'Latest DR drill passed', weight: 20 },
] as const;

export const DR_ALERTS = [
  { code: 'BACKUP_FAILURE', severity: 'CRITICAL' },
  { code: 'REPLICATION_FAILURE', severity: 'HIGH' },
  { code: 'RECOVERY_FAILURE', severity: 'CRITICAL' },
  { code: 'FAILOVER_FAILURE', severity: 'CRITICAL' },
] as const;

export const ESCALATION_MATRIX = [
  { level: 1, role: 'DevOps On-Call', responseMinutes: 15 },
  { level: 2, role: 'SRE Lead', responseMinutes: 30 },
  { level: 3, role: 'CTO', responseMinutes: 60 },
  { level: 4, role: 'CEO / Compliance', responseMinutes: 120 },
] as const;
