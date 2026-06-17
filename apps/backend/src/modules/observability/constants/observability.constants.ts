export const OBSERVABILITY_LOG_CATEGORIES = [
  'APPLICATION', 'AUTH', 'RBAC', 'CUSTOMER', 'LMS', 'LOS', 'DOCUMENT',
  'REFERRAL', 'COMMISSION', 'SUPPORT', 'NOTIFICATION', 'AI', 'DATABASE', 'SYSTEM', 'SECURITY', 'BUSINESS',
] as const;

export const OBSERVABILITY_BUSINESS_EVENTS = [
  'LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_SCORED', 'LEAD_CONVERTED',
  'APPLICATION_SUBMITTED', 'APPLICATION_APPROVED', 'APPLICATION_DISBURSED', 'APPLICATION_REJECTED',
  'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'COMMISSION_PAID', 'SUPPORT_RESOLVED',
  'CUSTOMER_CREATED', 'KYC_COMPLETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED',
] as const;

export const OBSERVABILITY_RETENTION_DEFAULTS = [
  { code: 'APP_LOGS', name: 'Application Logs', retentionType: 'APPLICATION', retentionDays: 30 },
  { code: 'AUDIT_LOGS', name: 'Audit Logs', retentionType: 'AUDIT', retentionDays: 365 },
  { code: 'SECURITY_LOGS', name: 'Security Logs', retentionType: 'SECURITY', retentionDays: 730 },
  { code: 'AI_LOGS', name: 'AI Logs', retentionType: 'AI', retentionDays: 90 },
  { code: 'SYSTEM_LOGS', name: 'System Logs', retentionType: 'SYSTEM', retentionDays: 14 },
] as const;

export const OBSERVABILITY_ERROR_ALERTS = [
  { code: 'ERROR_SPIKE', name: 'Error Spike', metric: 'error_rate', threshold: 50 },
  { code: 'AI_FAILURE', name: 'AI Failures', metric: 'ai_errors', threshold: 20 },
  { code: 'NOTIFICATION_FAILURE', name: 'Notification Failures', metric: 'notification_errors', threshold: 30 },
  { code: 'DATABASE_ERROR', name: 'Database Errors', metric: 'db_errors', threshold: 10 },
  { code: 'WORKFLOW_FAILURE', name: 'Failed Workflows', metric: 'workflow_errors', threshold: 5 },
] as const;
