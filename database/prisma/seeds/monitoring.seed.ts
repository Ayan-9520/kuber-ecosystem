import type { PrismaClient } from '@prisma/client';

const ALERT_RULES = [
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

export async function seedMonitoring(prisma: PrismaClient): Promise<void> {
  for (const rule of ALERT_RULES) {
    await prisma.monitoringAlertRule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        component: rule.component as never,
        metric: rule.metric,
        condition: rule.condition,
        threshold: rule.threshold,
        severity: rule.severity as never,
        channels: ['EMAIL', 'WEBHOOK'],
        isActive: true,
      },
      create: {
        code: rule.code,
        name: rule.name,
        description: `Auto-generated alert rule: ${rule.name}`,
        component: rule.component as never,
        metric: rule.metric,
        condition: rule.condition,
        threshold: rule.threshold,
        severity: rule.severity as never,
        channels: ['EMAIL', 'WEBHOOK'],
        isActive: true,
      },
    });
  }

  console.log(`  → monitoring alert rules seeded (${ALERT_RULES.length} rules)`);
}
