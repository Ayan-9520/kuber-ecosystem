export const HYPERCARE_PERMISSIONS = {
  READ: 'hypercare.read',
  MANAGE: 'hypercare.manage',
  RESOLVE: 'hypercare.resolve',
} as const;

export const HYPERCARE_PHASES = [
  { phase: 'WEEK_1', week: 1, label: 'Week 1 — Intensive Monitoring' },
  { phase: 'WEEK_2', week: 2, label: 'Week 2 — Stabilization' },
  { phase: 'WEEK_3', week: 3, label: 'Week 3 — Optimization' },
  { phase: 'WEEK_4', week: 4, label: 'Week 4 — Handover Prep' },
  { phase: 'EXTENSION', week: 5, label: 'Optional Extension' },
] as const;

export const SLA_RESPONSE_MINUTES: Record<string, number> = {
  SEV_1: 15,
  SEV_2: 30,
  SEV_3: 240,
  SEV_4: 480,
};

export const PRODUCTION_MONITORING = [
  'System Health', 'API Health', 'Database Health', 'Queue Health', 'AI Health', 'Notification Health',
] as const;

export const BUSINESS_MONITORING = [
  'Customer Registrations', 'Customer Logins', 'DSA Logins', 'Lead Creation', 'Application Creation',
  'Document Uploads', 'Referral Activity', 'Commission Activity', 'Support Tickets',
] as const;

export const ADOPTION_METRICS = [
  'Daily Active Users', 'Weekly Active Users', 'Feature Usage', 'AI Usage', 'Voice AI Usage', 'Drop Off Analysis',
] as const;

export const PERFORMANCE_TUNING = [
  'Slow APIs', 'Slow Queries', 'Queue Delays', 'AI Latency', 'Notification Latency', 'Frontend Performance', 'Mobile Performance',
] as const;

export const AI_SUPPORT_AREAS = [
  'AI Advisor', 'Voice AI', 'Lead Scoring', 'Recommendations', 'Knowledge Base', 'RAG', 'OpenAI Costs',
] as const;

export const HOTFIX_WORKFLOW = [
  'Emergency Hotfix Request',
  'Incident Commander Approval',
  'DevOps Deployment',
  'Smoke Validation',
  'Rollback Ready',
] as const;

export const SUCCESS_CRITERIA = [
  'Stable Production',
  'No Critical Incidents',
  'Healthy Adoption',
  'Acceptable Performance',
  'Positive User Feedback',
] as const;

export const RCA_TYPES = ['INCIDENT', 'ISSUE', 'PERFORMANCE', 'SECURITY'] as const;

export const REPORT_TYPES = ['DAILY', 'WEEKLY', 'EXECUTIVE', 'INCIDENT', 'ADOPTION', 'PERFORMANCE', 'HYPERCARE'] as const;

export const INCIDENT_RUNBOOKS: Record<string, string> = {
  SEV_1: 'Critical — immediate war room, all-hands, fix-forward vs rollback within 15 minutes.',
  SEV_2: 'High — engineering + ops on bridge within 30 minutes.',
  SEV_3: 'Medium — assign owner, resolve within 4 hours.',
  SEV_4: 'Low — triage within 1 business day.',
};
