import os from 'node:os';

import { prisma } from '../../../config/database.js';
import { env } from '../../../config/env.js';

const startTime = Date.now();

export const monitoringHealthService = {
  liveness() {
    return {
      status: 'ok',
      service: 'kuberone-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    };
  },

  async readiness() {
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
    let healthy = true;

    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch (err) {
      healthy = false;
      checks.database = {
        status: 'error',
        latencyMs: Date.now() - dbStart,
        error: err instanceof Error ? err.message : 'Database unreachable',
      };
    }

    return {
      status: healthy ? 'ok' : 'degraded',
      service: 'kuberone-api',
      environment: env.APP_ENV,
      timestamp: new Date().toISOString(),
      checks,
    };
  },

  async deepHealth() {
    const [readiness, system, queueCounts] = await Promise.all([
      monitoringHealthService.readiness(),
      monitoringHealthService.systemProbe(),
      monitoringHealthService.queueProbe(),
    ]);

    const workers = [
      'notification', 'automation', 'content', 'analytics',
      'executive-analytics', 'branch-analytics', 'regional-analytics',
      'email', 'sms', 'push',
    ].map((name) => ({ name, status: 'running' }));

    const components = {
      backend: readiness.status,
      crm: readiness.status,
      customerApp: 'external',
      dsaApp: 'external',
      database: readiness.checks.database?.status ?? 'unknown',
      aiSystems: 'probe_required',
      notifications: queueCounts.totalPending > 5000 ? 'degraded' : 'ok',
      infrastructure: system.memoryUsagePercent > 90 ? 'degraded' : 'ok',
    };

    const allOk = readiness.status === 'ok' && Object.values(components).every((s) => s === 'ok' || s === 'external' || s === 'probe_required' || s === 'running');

    return {
      status: allOk ? 'ok' : 'degraded',
      service: 'kuberone-api',
      version: env.API_VERSION,
      environment: env.APP_ENV,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      components,
      workers,
      system,
      queues: queueCounts,
      readiness: readiness.checks,
    };
  },

  systemProbe() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    return {
      hostname: os.hostname(),
      platform: os.platform(),
      cpuCount: cpus.length,
      loadAverage: loadAvg,
      cpuUsagePercent: Math.min(100, Math.round((loadAvg[0]! / Math.max(cpus.length, 1)) * 100)),
      memoryTotalMb: Math.round(totalMem / 1024 / 1024),
      memoryUsedMb: Math.round(usedMem / 1024 / 1024),
      memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
      processMemoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.floor(os.uptime()),
    };
  },

  async queueProbe() {
    const [notification, automation, deadLetter] = await Promise.all([
      prisma.notificationQueue.count({ where: { status: 'PENDING' } }),
      prisma.automationQueue.count({ where: { status: 'PENDING' } }),
      prisma.notificationDeadLetter.count(),
    ]);

    return {
      notificationPending: notification,
      automationPending: automation,
      deadLetterCount: deadLetter,
      totalPending: notification + automation,
    };
  },
};
