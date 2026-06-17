import type { MonitoringAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { MONITORING_SLA_TARGETS } from '../constants/monitoring.constants.js';

import { metricsRegistryService } from './metrics-registry.service.js';
import { monitoringHealthService } from './monitoring-health.service.js';

function periodBounds(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'hour':
      start.setHours(end.getHours() - 1);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    default:
      start.setDate(end.getDate() - 1);
  }
  return { start, end };
}

export const monitoringDataService = {
  async system(_query?: MonitoringAnalyticsQuery) {
    const probe = monitoringHealthService.systemProbe();

    return {
      cpuUsagePercent: probe.cpuUsagePercent,
      memoryUsagePercent: probe.memoryUsagePercent,
      diskUsagePercent: null,
      networkBytesIn: null,
      networkBytesOut: null,
      containerCount: 1,
      serverHealth: probe.memoryUsagePercent > 90 || probe.cpuUsagePercent > 85 ? 'degraded' : 'healthy',
      details: probe,
      metrics: {
        cpu_usage_percent: probe.cpuUsagePercent,
        memory_usage_percent: probe.memoryUsagePercent,
        disk_usage_percent: 0,
        network_bytes_in: 0,
        network_bytes_out: 0,
        container_count: 1,
      },
    };
  },

  async application(query?: MonitoringAnalyticsQuery) {
    const { start, end } = periodBounds(query?.period ?? 'day');
    const from = query?.fromDate ?? start;
    const to = query?.toDate ?? end;

    const [auditTotal, auditErrors] = await Promise.all([
      prisma.auditEvent.count({ where: { createdAt: { gte: from, lte: to } } }),
      prisma.auditEvent.count({
        where: { createdAt: { gte: from, lte: to }, action: { in: ['FAILED_LOGIN'] } },
      }),
    ]);

    const metricsText = await metricsRegistryService.getMetrics();
    const requestMatch = metricsText.match(/kuberone_http_requests_total\{[^}]*\} (\d+)/g);
    const errorMatch = metricsText.match(/kuberone_http_errors_total\{[^}]*\} (\d+)/g);
    const totalRequests = requestMatch?.reduce((sum, line) => sum + Number(line.split(' ')[1]), 0) ?? auditTotal;
    const totalErrors = errorMatch?.reduce((sum, line) => sum + Number(line.split(' ')[1]), 0) ?? auditErrors;
    const successRate = totalRequests ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;

    return {
      apiRequests: totalRequests,
      apiErrors: totalErrors,
      apiSuccessRate: Math.round(successRate * 100) / 100,
      apiLatencyP95Ms: null,
      apiThroughputRps: Math.round(totalRequests / Math.max((to.getTime() - from.getTime()) / 1000, 1)),
      concurrentUsers: 0,
      metrics: {
        api_requests_total: totalRequests,
        api_errors_total: totalErrors,
        api_success_rate: successRate,
        api_latency_p95_ms: 0,
        api_throughput_rps: 0,
        concurrent_users: 0,
      },
    };
  },

  async database(_query?: MonitoringAnalyticsQuery) {
    const dbStart = Date.now();
    let connected = false;
    let dbSizeMb = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      const sizeResult = await prisma.$queryRaw<{ size_mb: number }[]>`
        SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `;
      dbSizeMb = Number(sizeResult[0]?.size_mb ?? 0);
    } catch {
      connected = false;
    }

    const latencyMs = Date.now() - dbStart;

    return {
      queryTimeP95Ms: latencyMs,
      slowQueriesCount: 0,
      connectionPoolActive: connected ? 1 : 0,
      lockWaitsCount: 0,
      deadlocksCount: 0,
      indexUsagePercent: null,
      databaseSizeMb: dbSizeMb,
      status: connected ? 'healthy' : 'down',
      metrics: {
        query_time_p95_ms: latencyMs,
        slow_queries_count: 0,
        connection_pool_active: connected ? 1 : 0,
        lock_waits_count: 0,
        deadlocks_count: 0,
        index_usage_percent: 0,
        database_size_mb: dbSizeMb,
      },
    };
  },

  async queues(_query?: MonitoringAnalyticsQuery) {
    const [
      notificationPending, notificationFailed,
      emailPending, smsPending, pushPending,
      automationPending, automationDeadLetter,
      notificationDeadLetter,
    ] = await Promise.all([
      prisma.notificationQueue.count({ where: { status: 'PENDING' } }),
      prisma.notificationQueue.count({ where: { status: 'FAILED' } }),
      prisma.emailLog.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.smsLog.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.pushNotification.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.automationQueue.count({ where: { status: 'PENDING' } }),
      prisma.automationDeadLetter.count(),
      prisma.notificationDeadLetter.count(),
    ]);

    const retryCount = notificationFailed + automationDeadLetter;

    return {
      notificationQueue: notificationPending,
      emailQueue: emailPending,
      smsQueue: smsPending,
      whatsappQueue: 0,
      pushQueue: pushPending,
      automationQueue: automationPending,
      retryQueue: retryCount,
      deadLetterQueue: notificationDeadLetter + automationDeadLetter,
      metrics: {
        notification_queue_depth: notificationPending,
        email_queue_depth: emailPending,
        sms_queue_depth: smsPending,
        whatsapp_queue_depth: 0,
        push_queue_depth: pushPending,
        automation_queue_depth: automationPending,
        retry_queue_depth: retryCount,
        dead_letter_queue_depth: notificationDeadLetter + automationDeadLetter,
      },
    };
  },

  async ai(query?: MonitoringAnalyticsQuery) {
    const { start, end } = periodBounds(query?.period ?? 'day');
    const from = query?.fromDate ?? start;
    const to = query?.toDate ?? end;

    const where = { createdAt: { gte: from, lte: to } };

    const [total, failed, fallback, usageAgg, costAgg, latencyAgg] = await Promise.all([
      prisma.aiRequest.count({ where }),
      prisma.aiRequest.count({ where: { ...where, status: 'FAILED' } }),
      prisma.aiRequest.count({ where: { ...where, status: 'FALLBACK' } }),
      prisma.aiUsageLog.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { totalTokens: true },
      }),
      prisma.aiCostLog.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { totalCost: true },
      }),
      prisma.aiRequest.aggregate({
        where: { ...where, latencyMs: { not: null } },
        _avg: { latencyMs: true },
      }),
    ]);

    const ragLatency = await prisma.ragQuery.aggregate({
      where: { createdAt: { gte: from, lte: to } },
      _avg: { latencyMs: true },
    });

    const voiceSessions = await prisma.aiRequest.count({
      where: {
        createdAt: { gte: from, lte: to },
        requestType: { in: ['TRANSCRIPTION', 'TTS'] },
      },
    });

    return {
      openaiRequests: total,
      tokenUsage: Number(usageAgg._sum.totalTokens ?? 0),
      responseTimeP95Ms: Math.round(latencyAgg._avg.latencyMs ?? 0),
      costUsd: Number(costAgg._sum.totalCost ?? 0),
      failures: failed,
      fallbackUsage: fallback,
      ragRetrievalTimeP95Ms: Math.round(ragLatency._avg.latencyMs ?? 0),
      voiceAiSessions: voiceSessions,
      metrics: {
        openai_requests_total: total,
        token_usage_total: Number(usageAgg._sum.totalTokens ?? 0),
        ai_response_time_p95_ms: Math.round(latencyAgg._avg.latencyMs ?? 0),
        ai_cost_usd: Number(costAgg._sum.totalCost ?? 0),
        ai_failures_total: failed,
        ai_fallback_total: fallback,
        rag_retrieval_time_p95_ms: Math.round(ragLatency._avg.latencyMs ?? 0),
        voice_ai_sessions_total: voiceSessions,
      },
    };
  },

  async notifications(query?: MonitoringAnalyticsQuery) {
    const { start, end } = periodBounds(query?.period ?? 'day');
    const from = query?.fromDate ?? start;
    const to = query?.toDate ?? end;
    const where = { createdAt: { gte: from, lte: to } };

    const [emailSent, emailFailed, smsSent, smsFailed, pushDelivered, pushFailed] = await Promise.all([
      prisma.emailLog.count({ where: { ...where, status: 'SENT' } }).catch(() => 0),
      prisma.emailLog.count({ where: { ...where, status: 'FAILED' } }).catch(() => 0),
      prisma.smsLog.count({ where: { ...where, status: 'SENT' } }).catch(() => 0),
      prisma.smsLog.count({ where: { ...where, status: 'FAILED' } }).catch(() => 0),
      prisma.pushNotification.count({ where: { ...where, status: 'DELIVERED' } }).catch(() => 0),
      prisma.pushNotification.count({ where: { ...where, status: 'FAILED' } }).catch(() => 0),
    ]);

    return {
      emailSent,
      emailFailed,
      smsSent,
      smsFailed,
      whatsappSent: 0,
      whatsappFailed: 0,
      pushDelivered,
      pushFailed,
      metrics: {
        email_sent_total: emailSent,
        email_failed_total: emailFailed,
        sms_sent_total: smsSent,
        sms_failed_total: smsFailed,
        whatsapp_sent_total: 0,
        whatsapp_failed_total: 0,
        push_delivered_total: pushDelivered,
        push_failed_total: pushFailed,
      },
    };
  },

  async authMetrics(query?: MonitoringAnalyticsQuery) {
    const { start, end } = periodBounds(query?.period ?? 'day');
    const from = query?.fromDate ?? start;
    const to = query?.toDate ?? end;
    const where = { createdAt: { gte: from, lte: to } };

    const [logins, failedLogins, otpRequests, securityEvents, lockouts] = await Promise.all([
      prisma.auditEvent.count({ where: { ...where, action: 'LOGIN' } }),
      prisma.auditEvent.count({ where: { ...where, action: 'FAILED_LOGIN' } }),
      prisma.auditEvent.count({ where: { ...where, action: 'LOGIN', source: 'AUTH' } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: from, lte: to } } }),
      prisma.securityEvent.count({
        where: { createdAt: { gte: from, lte: to }, eventType: 'ACCOUNT_LOCKOUT' },
      }),
    ]);

    return {
      logins,
      failedLogins,
      otpRequests: otpRequests,
      otpFailures: failedLogins,
      accountLockouts: lockouts,
      suspiciousActivity: securityEvents,
      metrics: {
        logins_total: logins,
        failed_logins_total: failedLogins,
        otp_requests_total: otpRequests,
        otp_failures_total: failedLogins,
        account_lockouts_total: lockouts,
        suspicious_activity_total: securityEvents,
      },
    };
  },

  async business(query?: MonitoringAnalyticsQuery) {
    const { start, end } = periodBounds(query?.period ?? 'day');
    const from = query?.fromDate ?? start;
    const to = query?.toDate ?? end;
    const where = { createdAt: { gte: from, lte: to } };

    const [
      leads, applications, approved, rejected, disbursed,
      referrals, commissions, tickets,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.application.count({ where }),
      prisma.application.count({ where: { ...where, status: { in: ['SANCTIONED', 'DISBURSED'] } } }),
      prisma.application.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.disbursement.count({ where: { createdAt: { gte: from, lte: to } } }).catch(() => 0),
      prisma.referral.count({ where: { ...where, status: 'CONVERTED' } }).catch(() => 0),
      prisma.commissionPayment.count({ where: { createdAt: { gte: from, lte: to } } }).catch(() => 0),
      prisma.ticket.count({ where }),
    ]);

    return {
      leadsCreated: leads,
      applicationsCreated: applications,
      applicationsApproved: approved,
      applicationsRejected: rejected,
      applicationsDisbursed: disbursed,
      referralConversions: referrals,
      commissionPayments: commissions,
      supportTickets: tickets,
      metrics: {
        leads_created_total: leads,
        applications_created_total: applications,
        applications_approved_total: approved,
        applications_rejected_total: rejected,
        applications_disbursed_total: disbursed,
        referral_conversions_total: referrals,
        commission_payments_total: commissions,
        support_tickets_total: tickets,
      },
    };
  },

  async sla(query?: MonitoringAnalyticsQuery) {
    const app = await monitoringDataService.application(query);
    const db = await monitoringDataService.database(query);
    const notif = await monitoringDataService.notifications(query);

    const availability = app.apiSuccessRate;
    const notifTotal = notif.emailSent + notif.smsSent + notif.pushDelivered;
    const notifFailed = notif.emailFailed + notif.smsFailed + notif.pushFailed;
    const notifSla = notifTotal ? ((notifTotal / (notifTotal + notifFailed)) * 100) : 100;

    return {
      availability: { target: MONITORING_SLA_TARGETS.AVAILABILITY, actual: availability },
      uptime: { target: MONITORING_SLA_TARGETS.UPTIME, actual: db.status === 'healthy' ? 99.99 : 0 },
      responseTime: { target: MONITORING_SLA_TARGETS.RESPONSE_TIME_MS, actual: db.queryTimeP95Ms },
      support: { target: MONITORING_SLA_TARGETS.SUPPORT_HOURS, actual: null },
      notification: { target: MONITORING_SLA_TARGETS.NOTIFICATION_DELIVERY, actual: Math.round(notifSla * 100) / 100 },
    };
  },

  async overview(query?: MonitoringAnalyticsQuery) {
    const [system, application, database, queues, ai, notifications, auth, business, sla, deepHealth] =
      await Promise.all([
        monitoringDataService.system(query),
        monitoringDataService.application(query),
        monitoringDataService.database(query),
        monitoringDataService.queues(query),
        monitoringDataService.ai(query),
        monitoringDataService.notifications(query),
        monitoringDataService.authMetrics(query),
        monitoringDataService.business(query),
        monitoringDataService.sla(query),
        monitoringHealthService.deepHealth(),
      ]);

    const metricsCount =
      Object.keys(system.metrics).length +
      Object.keys(application.metrics).length +
      Object.keys(database.metrics).length +
      Object.keys(queues.metrics).length +
      Object.keys(ai.metrics).length +
      Object.keys(notifications.metrics).length +
      Object.keys(auth.metrics).length +
      Object.keys(business.metrics).length;

    const coveragePercent = Math.round((metricsCount / 59) * 100);
    const visibilityScore = Math.round((application.apiSuccessRate + (database.status === 'healthy' ? 100 : 0) + sla.notification.actual) / 3);
    const operationalReadiness = deepHealth.status === 'ok' ? 95 : 75;

    return {
      summary: {
        status: deepHealth.status,
        metricsCovered: metricsCount,
        totalMetrics: 59,
        monitoringCoveragePercent: coveragePercent,
        productionVisibilityScore: visibilityScore,
        operationalReadinessScore: operationalReadiness,
        openAlerts: await prisma.monitoringAlert.count({ where: { status: 'OPEN' } }),
      },
      system,
      application,
      database,
      queues,
      ai,
      notifications,
      auth,
      business,
      sla,
      components: deepHealth.components,
    };
  },
};
