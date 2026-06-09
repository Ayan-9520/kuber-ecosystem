export const ANALYTICS_ROUTE_PREFIX = '/analytics';

export const METRIC_CODES = {
  TOTAL_LEADS: 'total_leads',
  HOT_LEADS: 'hot_leads',
  APPLICATIONS: 'applications',
  APPROVALS: 'approvals',
  SANCTIONS: 'sanctions',
  DISBURSEMENTS: 'disbursements',
  REVENUE: 'revenue',
  COMMISSION_PAID: 'commission_paid',
  COMMISSION_PENDING: 'commission_pending',
  PARTNER_PERFORMANCE: 'partner_performance',
  CUSTOMER_GROWTH: 'customer_growth',
  DOCUMENT_COMPLETION: 'document_completion',
  TAT_DAYS: 'tat_days',
  APPROVAL_RATE: 'approval_rate',
  DISBURSAL_RATE: 'disbursal_rate',
  CONVERSION_RATE: 'conversion_rate',
  AI_USAGE: 'ai_usage',
  VOICE_AI_USAGE: 'voice_ai_usage',
  NOTIFICATION_SENT: 'notification_sent',
  SUPPORT_OPEN: 'support_open',
} as const;

export const DEFAULT_DASHBOARDS = [
  { code: 'system', name: 'System Dashboard', dashboardType: 'SYSTEM' as const },
  { code: 'business', name: 'Business Dashboard', dashboardType: 'BUSINESS' as const },
  { code: 'operations', name: 'Operations Dashboard', dashboardType: 'OPERATIONS' as const },
  { code: 'sales', name: 'Sales Dashboard', dashboardType: 'SALES' as const },
  { code: 'credit', name: 'Credit Dashboard', dashboardType: 'CREDIT' as const },
  { code: 'management', name: 'Management Dashboard', dashboardType: 'MANAGEMENT' as const },
];

export const CACHE_TTL_MS = 60_000;
