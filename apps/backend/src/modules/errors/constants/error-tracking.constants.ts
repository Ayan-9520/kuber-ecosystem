export const ERROR_TRACKING_SOURCES = [
  'BACKEND', 'CRM', 'CUSTOMER_APP', 'DSA_APP', 'AI', 'NOTIFICATION',
  'DATABASE', 'QUEUE', 'INFRASTRUCTURE', 'VOICE_AI', 'RAG', 'OPENAI',
] as const;

export const ERROR_LIFECYCLE_STATUSES = [
  'NEW', 'INVESTIGATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED',
] as const;

export const ERROR_ALERT_RULES = [
  { code: 'CRITICAL_ERROR', name: 'Critical Error Detected', source: 'BACKEND', severity: 'CRITICAL', threshold: 1 },
  { code: 'CRASH_LOOP', name: 'Crash Loop Detected', source: 'BACKEND', severity: 'CRITICAL', threshold: 10 },
  { code: 'AI_FAILURE', name: 'AI Failure Spike', source: 'AI', severity: 'HIGH', threshold: 5 },
  { code: 'DATABASE_FAILURE', name: 'Database Failure', source: 'DATABASE', severity: 'CRITICAL', threshold: 1 },
  { code: 'AUTH_FAILURE', name: 'Authentication Failure Spike', source: 'BACKEND', severity: 'HIGH', threshold: 20 },
  { code: 'NOTIFICATION_FAILURE', name: 'Notification Failure Spike', source: 'NOTIFICATION', severity: 'HIGH', threshold: 10 },
] as const;

export const ERROR_DEPLOYMENT_GATE = {
  maxCriticalUnresolved: Number(process.env.ERROR_GATE_MAX_CRITICAL ?? 5),
  windowHours: Number(process.env.ERROR_GATE_WINDOW_HOURS ?? 24),
} as const;

export const ERROR_COVERAGE_TYPES = [
  'Backend Exceptions', 'Frontend Exceptions', 'React Errors', 'React Native Errors',
  'API Errors', 'Database Errors', 'Prisma Errors', 'Queue Errors', 'Notification Errors',
  'AI Errors', 'Voice AI Errors', 'OpenAI Errors', 'RAG Errors', 'Infrastructure Errors',
  'Validation Errors', 'Authorization Errors', 'Authentication Errors', 'Business Rule Errors',
  'Worker Failures', 'Cron Failures', 'Dead Letter Events', 'Page Crashes', 'Component Errors',
] as const;
