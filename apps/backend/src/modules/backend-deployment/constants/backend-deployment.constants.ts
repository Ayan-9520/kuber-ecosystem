export const BACKEND_DEPLOYMENT_PERMISSIONS = {
  DEPLOY: 'backend.deploy',
  RELEASE: 'backend.release',
  MANAGE: 'backend.manage',
} as const;

export const PRODUCTION_API_DOMAIN = 'api.kuberone.com' as const;

export const DEPLOY_SERVICES = [
  { code: 'backend-api', name: 'Backend API', category: 'core' },
  { code: 'worker-services', name: 'Worker Services', category: 'core' },
  { code: 'queue-processors', name: 'Queue Processors', category: 'core' },
  { code: 'notification-workers', name: 'Notification Workers', category: 'notifications' },
  { code: 'email-workers', name: 'Email Workers', category: 'notifications' },
  { code: 'sms-workers', name: 'SMS Workers', category: 'notifications' },
  { code: 'whatsapp-workers', name: 'WhatsApp Workers', category: 'notifications' },
  { code: 'push-workers', name: 'Push Workers', category: 'notifications' },
  { code: 'ai-workers', name: 'AI Workers', category: 'ai' },
  { code: 'scheduler-services', name: 'Scheduler Services', category: 'core' },
  { code: 'automation-workers', name: 'Automation Workers', category: 'automation' },
] as const;

export const API_MODULES = [
  'Auth', 'RBAC', 'Users', 'Customers', 'KYC', 'Products', 'Eligibility', 'EMI',
  'LMS', 'LOS', 'Documents', 'Referrals', 'Commissions', 'Notifications', 'Support',
  'Knowledge Base', 'RAG', 'AI Advisor', 'Voice AI', 'AI Copilot', 'Lead Scoring',
  'Recommendations', 'Campaigns', 'Automation', 'Content Engine', 'Analytics', 'Audit',
  'Compliance', 'Monitoring', 'Observability', 'Error Tracking',
] as const;

export const QUEUE_SYSTEMS = [
  { id: 'notifications', label: 'Notifications Queue' },
  { id: 'email', label: 'Email Queue' },
  { id: 'sms', label: 'SMS Queue' },
  { id: 'whatsapp', label: 'WhatsApp Queue' },
  { id: 'push', label: 'Push Queue' },
  { id: 'ai', label: 'AI Queue' },
  { id: 'automation', label: 'Automation Queue' },
  { id: 'dead-letter', label: 'Dead Letter Queue' },
  { id: 'retry', label: 'Retry Queue' },
] as const;

export const AI_SERVICES = [
  'AI Advisor', 'Voice AI', 'Lead Scoring', 'Recommendation Engine',
  'Knowledge Base', 'RAG Pipeline', 'Content Generation Engine', 'OpenAI Integration Layer',
] as const;

export const BUILD_VALIDATION_STEPS = [
  'pnpm lint', 'pnpm typecheck', 'pnpm build', 'pnpm test',
  'pnpm test:integration', 'pnpm security:test',
] as const;

export const DEPLOYMENT_READINESS_CHECKLIST = [
  { id: 'domain', label: 'api.kuberone.com configured', weight: 10 },
  { id: 'https', label: 'HTTPS + security headers', weight: 10 },
  { id: 'migrations', label: 'Database migrations applied', weight: 15 },
  { id: 'redis', label: 'Redis caching & queues', weight: 10 },
  { id: 'health', label: 'Health endpoints verified', weight: 10 },
  { id: 'monitoring', label: 'Prometheus/Grafana integrated', weight: 10 },
  { id: 'observability', label: 'Logs/metrics/traces', weight: 10 },
  { id: 'backup', label: 'Backup integration validated', weight: 10 },
  { id: 'workers', label: 'All workers deployed', weight: 15 },
] as const;

export const SECURITY_CHECKLIST = [
  { id: 'https', label: 'HTTPS enforced', weight: 15 },
  { id: 'headers', label: 'Security headers', weight: 10 },
  { id: 'rateLimit', label: 'Rate limiting', weight: 10 },
  { id: 'rbac', label: 'RBAC enforcement', weight: 15 },
  { id: 'scope', label: 'Data scope enforcement', weight: 15 },
  { id: 'jwt', label: 'JWT + refresh rotation', weight: 15 },
  { id: 'encryption', label: 'Encryption at rest/transit', weight: 10 },
  { id: 'secrets', label: 'Secrets management', weight: 10 },
] as const;

export const SCALABILITY_CHECKLIST = [
  { id: 'horizontal', label: 'Horizontal scaling ready', weight: 25 },
  { id: 'multiInstance', label: 'Multi-instance deployment', weight: 25 },
  { id: 'loadBalancer', label: 'Load balancer integration', weight: 25 },
  { id: 'k8sReady', label: 'Kubernetes-ready architecture', weight: 25 },
] as const;
