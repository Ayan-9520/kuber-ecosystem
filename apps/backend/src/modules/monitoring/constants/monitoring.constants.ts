export const MONITORING_METRICS = {
  SYSTEM: ['cpu_usage_percent', 'memory_usage_percent', 'disk_usage_percent', 'network_bytes_in', 'network_bytes_out', 'container_count'],
  APPLICATION: ['api_requests_total', 'api_latency_p95_ms', 'api_errors_total', 'api_success_rate', 'api_throughput_rps', 'concurrent_users'],
  DATABASE: ['query_time_p95_ms', 'slow_queries_count', 'connection_pool_active', 'lock_waits_count', 'deadlocks_count', 'index_usage_percent', 'database_size_mb'],
  QUEUE: ['notification_queue_depth', 'email_queue_depth', 'sms_queue_depth', 'whatsapp_queue_depth', 'push_queue_depth', 'automation_queue_depth', 'retry_queue_depth', 'dead_letter_queue_depth'],
  AI: ['openai_requests_total', 'token_usage_total', 'ai_response_time_p95_ms', 'ai_cost_usd', 'ai_failures_total', 'ai_fallback_total', 'rag_retrieval_time_p95_ms', 'voice_ai_sessions_total'],
  NOTIFICATION: ['email_sent_total', 'email_failed_total', 'sms_sent_total', 'sms_failed_total', 'whatsapp_sent_total', 'whatsapp_failed_total', 'push_delivered_total', 'push_failed_total'],
  AUTH: ['logins_total', 'failed_logins_total', 'otp_requests_total', 'otp_failures_total', 'account_lockouts_total', 'suspicious_activity_total'],
  BUSINESS: ['leads_created_total', 'applications_created_total', 'applications_approved_total', 'applications_rejected_total', 'applications_disbursed_total', 'referral_conversions_total', 'commission_payments_total', 'support_tickets_total'],
  ANALYTICS: ['dashboard_load_time_p95_ms', 'report_generation_time_p95_ms', 'export_generation_time_p95_ms'],
} as const;

export const MONITORING_SLA_TARGETS = {
  AVAILABILITY: 99.9,
  UPTIME: 99.95,
  RESPONSE_TIME_MS: 500,
  SUPPORT_HOURS: 4,
  NOTIFICATION_DELIVERY: 99.5,
} as const;

export const DEFAULT_ALERT_RULES = [
  { code: 'API_DOWN', name: 'API Down', component: 'APPLICATION', metric: 'api_success_rate', condition: 'lt', threshold: 50, severity: 'CRITICAL' },
  { code: 'HIGH_ERROR_RATE', name: 'High Error Rate', component: 'APPLICATION', metric: 'api_errors_total', condition: 'gt', threshold: 100, severity: 'HIGH' },
  { code: 'HIGH_LATENCY', name: 'High Latency', component: 'APPLICATION', metric: 'api_latency_p95_ms', condition: 'gt', threshold: 2000, severity: 'HIGH' },
  { code: 'DATABASE_FAILURE', name: 'Database Failure', component: 'DATABASE', metric: 'connection_pool_active', condition: 'eq', threshold: 0, severity: 'CRITICAL' },
  { code: 'QUEUE_BACKLOG', name: 'Queue Backlog', component: 'QUEUE', metric: 'notification_queue_depth', condition: 'gt', threshold: 1000, severity: 'HIGH' },
  { code: 'NOTIFICATION_FAILURE', name: 'Notification Failure Spike', component: 'NOTIFICATION', metric: 'email_failed_total', condition: 'gt', threshold: 50, severity: 'HIGH' },
  { code: 'AI_FAILURE', name: 'AI Failure Rate', component: 'AI', metric: 'ai_failures_total', condition: 'gt', threshold: 20, severity: 'HIGH' },
  { code: 'HIGH_OPENAI_COST', name: 'High OpenAI Cost', component: 'AI', metric: 'ai_cost_usd', condition: 'gt', threshold: 500, severity: 'MEDIUM' },
  { code: 'MEMORY_LEAK', name: 'Memory Leak', component: 'SYSTEM', metric: 'memory_usage_percent', condition: 'gt', threshold: 90, severity: 'CRITICAL' },
  { code: 'CPU_SPIKE', name: 'CPU Spike', component: 'SYSTEM', metric: 'cpu_usage_percent', condition: 'gt', threshold: 85, severity: 'HIGH' },
  { code: 'DISK_FULL', name: 'Disk Full', component: 'SYSTEM', metric: 'disk_usage_percent', condition: 'gt', threshold: 90, severity: 'CRITICAL' },
  { code: 'AUTH_ATTACK', name: 'Suspicious Auth Activity', component: 'AUTH', metric: 'failed_logins_total', condition: 'gt', threshold: 100, severity: 'HIGH' },
] as const;

export const ALERT_CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'SLACK', 'WEBHOOK'] as const;
