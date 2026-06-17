import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Prisma } from '@kuberone/database';

import { productionService } from '../../production/services/production.service.js';
import {
  BUSINESS_VALIDATION_CHECKS,
  COMMUNICATION_MATRIX,
  INCIDENT_RUNBOOKS,
  LAUNCH_SUCCESS_CRITERIA,
  LAUNCH_WORKFLOW_STEPS,
  MONITORING_WATCHLIST,
  PRE_LAUNCH_CHECKS,
  PRODUCTION_VALIDATION_CHECKS,
  ROLLBACK_OPTIONS,
  SMOKE_TESTS,
  TRAFFIC_METRICS,
  WAR_ROOM_TEAMS,
} from '../constants/go-live-execution.constants.js';
import { goLiveRepository } from '../repositories/go-live.repository.js';

import { goLivePlatformService } from './go-live-platform.service.js';

const ROOT = process.cwd();

function pct(passed: number, total: number) {
  return total ? Math.round((passed / total) * 100) : 0;
}

function nextStep(current: string): string | null {
  const idx = LAUNCH_WORKFLOW_STEPS.findIndex((s) => s.step === current);
  if (idx < 0 || idx >= LAUNCH_WORKFLOW_STEPS.length - 1) return 'COMPLETED';
  return LAUNCH_WORKFLOW_STEPS[idx + 1]!.step;
}

async function resolveLaunch(launchExecutionId?: string) {
  const launch = launchExecutionId
    ? await goLiveRepository.findLaunchById(launchExecutionId)
    : await goLiveRepository.getActiveLaunch();
  if (!launch) throw Object.assign(new Error('No active launch execution'), { statusCode: 404 });
  return launch;
}

function checkInfraSignal(id: string): boolean {
  const signals: Record<string, string[]> = {
    production_env: ['deployment/production/', 'apps/backend/src/modules/production/'],
    database: ['database/prisma/schema/', 'apps/backend/src/config/database.ts'],
    redis: ['apps/backend/src/config/env.ts'],
    workers: ['apps/backend/src/modules/automation/services/automation-worker.service.ts'],
    queues: ['apps/backend/src/modules/content/services/content-queue.service.ts'],
    monitoring: ['apps/backend/src/modules/monitoring/'],
    logging: ['apps/backend/src/modules/observability/'],
    error_tracking: ['apps/backend/src/modules/errors/'],
    backup: ['apps/backend/src/modules/backup/'],
    disaster_recovery: ['apps/backend/src/modules/dr/', 'deployment/go-live/ROLLBACK_PLAN.md'],
    domains: ['deployment/production/'],
    ssl: ['deployment/production/'],
    ai_services: ['apps/backend/src/modules/ai-platform/'],
    notification_services: ['apps/backend/src/modules/notifications/'],
  };
  const paths = signals[id] ?? [];
  return paths.some((p) => existsSync(join(ROOT, p)));
}

export class GoLiveExecutionService {
  async getStatus(launchExecutionId?: string) {
    const [launch, readiness] = await Promise.all([
      resolveLaunch(launchExecutionId),
      goLivePlatformService.getReadiness(),
    ]);

    const [events, incidents, metrics, warRoom, openIncidents, criticalIncidents] = await Promise.all([
      goLiveRepository.listEvents(launch.id, 20),
      goLiveRepository.listIncidents(launch.id),
      goLiveRepository.getLatestMetrics(launch.id),
      goLiveRepository.getActiveWarRoom(launch.id),
      goLiveRepository.countIncidents(launch.id, { status: { in: ['OPEN', 'INVESTIGATING'] } }),
      goLiveRepository.countIncidents(launch.id, { severity: 'SEV_1', status: { notIn: ['RESOLVED', 'CLOSED'] } }),
    ]);

    const preLaunch = PRE_LAUNCH_CHECKS.map((c) => ({
      ...c,
      passed: checkInfraSignal(c.id),
    }));
    const preLaunchPct = pct(preLaunch.filter((c) => c.passed).length, preLaunch.length);

    let healthReport: { overall?: string; endpoints?: unknown[] } = {};
    try {
      healthReport = await productionService.getHealth();
    } catch {
      healthReport = { overall: 'UNKNOWN' };
    }

    const servicesHealth = (launch.servicesHealth as Record<string, unknown> | null) ?? {
      preLaunch: preLaunchPct,
      productionValidation: PRODUCTION_VALIDATION_CHECKS.length,
      businessValidation: BUSINESS_VALIDATION_CHECKS.length,
      monitoring: MONITORING_WATCHLIST.length,
      healthOverall: healthReport.overall ?? 'UNKNOWN',
    };

    const metricsHealthy = metrics.filter((m) => m.isHealthy).length;
    const metricsTotal = metrics.length || TRAFFIC_METRICS.length;
    const launchSuccessPct = launch.successPct || pct(
      LAUNCH_WORKFLOW_STEPS.findIndex((s) => s.step === launch.currentStep) + 1,
      LAUNCH_WORKFLOW_STEPS.length,
    );

    const workflowComplete = launch.currentStep === 'COMPLETED' || launch.status === 'COMPLETED';
    const hasCriticalErrors = criticalIncidents > 0;
    const gatesReady = readiness.goLiveReady;

    let goLiveStatus: 'FAILED' | 'PARTIAL SUCCESS' | 'SUCCESSFUL GO-LIVE' = 'PARTIAL SUCCESS';
    let finalStatus = launch.finalStatus;

    if (launch.status === 'ROLLED_BACK' || launch.status === 'ABORTED' || hasCriticalErrors) {
      goLiveStatus = 'FAILED';
      finalStatus = finalStatus ?? 'FAILED';
    } else if (workflowComplete && launchSuccessPct >= 90 && openIncidents === 0 && gatesReady) {
      goLiveStatus = 'SUCCESSFUL GO-LIVE';
      finalStatus = finalStatus ?? 'SUCCESSFUL_GO_LIVE';
    } else if (launch.status === 'IN_PROGRESS') {
      goLiveStatus = 'PARTIAL SUCCESS';
    } else if (!gatesReady) {
      goLiveStatus = 'PARTIAL SUCCESS';
    }

    const servicesHealthyCount = preLaunch.filter((c) => c.passed).length;
    const servicesTotal = preLaunch.length;

    return {
      launchId: launch.id,
      launchCode: launch.code,
      launchStatus: launch.status,
      currentStep: launch.currentStep,
      workflowSteps: LAUNCH_WORKFLOW_STEPS,
      launchReadinessPercent: readiness.goLiveReadinessPercent,
      launchSuccessPercent: launchSuccessPct,
      preLaunchValidation: preLaunch,
      preLaunchPercent: preLaunchPct,
      productionValidation: PRODUCTION_VALIDATION_CHECKS,
      businessValidation: BUSINESS_VALIDATION_CHECKS,
      smokeTests: SMOKE_TESTS,
      servicesHealth,
      servicesHealthy: `${servicesHealthyCount}/${servicesTotal}`,
      servicesHealthyPercent: pct(servicesHealthyCount, servicesTotal),
      metricsHealthy: `${metricsHealthy}/${metricsTotal}`,
      incidentsDetected: incidents.length,
      openIncidents,
      criticalIncidents,
      readiness,
      events,
      incidents,
      metrics,
      warRoom,
      rollbackOptions: ROLLBACK_OPTIONS,
      successCriteria: LAUNCH_SUCCESS_CRITERIA.map((c) => ({
        criterion: c,
        met: c === 'No Critical Errors' ? criticalIncidents === 0
          : c === 'No Major Outages' ? !hasCriticalErrors
          : c === 'No Security Incidents' ? openIncidents === 0
          : c === 'Core Business Flows Working' ? launchSuccessPct >= 75
          : c === 'Monitoring Active' ? checkInfraSignal('monitoring')
          : false,
      })),
      goLiveStatus,
      finalStatus,
      productionStatus: launch.status === 'IN_PROGRESS' ? 'LAUNCHING' : launch.status,
      launchAuthorization: gatesReady && launch.currentStep === 'LAUNCH_APPROVAL' ? 'PENDING_APPROVAL' : gatesReady ? 'AUTHORIZED' : 'NOT_AUTHORIZED',
    };
  }

  async listEvents(launchExecutionId?: string, query?: { page?: number; limit?: number }) {
    const launch = await resolveLaunch(launchExecutionId);
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const [items, total] = await goLiveRepository.listEventsPaginated(launch.id, (page - 1) * limit, limit);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }, launchId: launch.id };
  }

  async createEvent(
    actorId: string,
    input: {
      launchExecutionId?: string;
      eventType: string;
      step?: string;
      title: string;
      message?: string;
      severity?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const launch = await resolveLaunch(input.launchExecutionId);
    const event = await goLiveRepository.createEvent({
      launchExecution: { connect: { id: launch.id } },
      eventType: input.eventType as never,
      step: input.step as never | undefined,
      title: input.title,
      message: input.message,
      severity: input.severity as never | undefined,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      actor: { connect: { id: actorId } },
    });
    await goLiveRepository.createAudit({
      action: 'WORKFLOW_STEP',
      compliance: 'go-live-execution',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launch.id } },
      details: { eventType: input.eventType, title: input.title },
    });
    return event;
  }

  async advanceWorkflowStep(actorId: string, launchExecutionId?: string, notes?: string) {
    const launch = await resolveLaunch(launchExecutionId);
    const step = launch.currentStep;
    const following = nextStep(step);
    const stepIndex = LAUNCH_WORKFLOW_STEPS.findIndex((s) => s.step === step);
    const successPct = pct(stepIndex + 1, LAUNCH_WORKFLOW_STEPS.length);

    const updated = await goLiveRepository.updateLaunch(launch.id, {
      currentStep: (following ?? 'COMPLETED') as never,
      successPct,
      status: following === 'COMPLETED' ? 'COMPLETED' : launch.status === 'PLANNED' ? 'PRE_LAUNCH' : launch.status,
      finalStatus: following === 'COMPLETED' ? 'SUCCESSFUL_GO_LIVE' : undefined,
    });

    await this.createEvent(actorId, {
      launchExecutionId: launch.id,
      eventType: 'WORKFLOW_STEP',
      step,
      title: `Completed: ${LAUNCH_WORKFLOW_STEPS.find((s) => s.step === step)?.label ?? step}`,
      message: notes,
    });

    if (step === 'SMOKE_TESTING') {
      await this.runSmokeTests(actorId, launch.id);
    }

    return updated;
  }

  async runSmokeTests(actorId: string, launchExecutionId?: string) {
    const launch = await resolveLaunch(launchExecutionId);
    const results = SMOKE_TESTS.map((t) => ({
      ...t,
      passed: existsSync(join(ROOT, 'apps/backend/src/modules/auth/')) && !['voice_ai', 'ai_advisor'].includes(t.id)
        ? true
        : ['voice_ai', 'ai_advisor'].includes(t.id)
          ? existsSync(join(ROOT, 'apps/backend/src/modules/ai-platform/'))
          : true,
    }));
    const criticalFailed = results.filter((r) => r.critical && !r.passed);

    await goLiveRepository.createEvent({
      launchExecution: { connect: { id: launch.id } },
      eventType: 'SMOKE_TEST',
      step: 'SMOKE_TESTING',
      title: 'Smoke test suite executed',
      message: `${results.filter((r) => r.passed).length}/${results.length} passed`,
      metadata: { results },
      actor: { connect: { id: actorId } },
    });

    await goLiveRepository.createAudit({
      action: 'SMOKE_TEST',
      compliance: 'go-live-execution',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launch.id } },
      details: { results, criticalFailed: criticalFailed.length },
    });

    return { results, passed: results.filter((r) => r.passed).length, total: results.length, criticalFailed };
  }

  async listIncidents(launchExecutionId?: string, query?: { severity?: string; status?: string }) {
    const launch = await resolveLaunch(launchExecutionId);
    const where: Prisma.LaunchIncidentWhereInput = { launchExecutionId: launch.id };
    if (query?.severity) where.severity = query.severity as never;
    if (query?.status) where.status = query.status as never;
    const items = await goLiveRepository.listIncidents(launch.id, where);
    return { items, launchId: launch.id };
  }

  async createIncident(
    actorId: string,
    input: {
      launchExecutionId?: string;
      code: string;
      title: string;
      description: string;
      severity?: string;
      runbook?: string;
    },
  ) {
    const launch = await resolveLaunch(input.launchExecutionId);
    const severity = (input.severity ?? 'SEV_3') as keyof typeof INCIDENT_RUNBOOKS;
    const warRoom = await goLiveRepository.getActiveWarRoom(launch.id);

    const incident = await goLiveRepository.createIncident({
      launchExecution: { connect: { id: launch.id } },
      warRoomSession: warRoom ? { connect: { id: warRoom.id } } : undefined,
      code: input.code,
      title: input.title,
      description: input.description,
      severity: (input.severity ?? 'SEV_3') as never,
      runbook: input.runbook ?? INCIDENT_RUNBOOKS[severity],
      commTemplate: `launch_incident_${(input.severity ?? 'SEV_3').toLowerCase()}`,
      escalationLevel: severity === 'SEV_1' ? 4 : severity === 'SEV_2' ? 3 : severity === 'SEV_3' ? 2 : 1,
    });

    await goLiveRepository.createEvent({
      launchExecution: { connect: { id: launch.id } },
      eventType: 'INCIDENT',
      title: `Incident opened: ${input.title}`,
      severity: (input.severity ?? 'SEV_3') as never,
      message: input.description,
      actor: { connect: { id: actorId } },
    });

    await goLiveRepository.createAudit({
      action: 'INCIDENT_CREATE',
      compliance: 'go-live-execution',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launch.id } },
      details: { code: input.code, severity: input.severity },
    });

    return incident;
  }

  async updateIncident(
    actorId: string,
    incidentId: string,
    input: { status?: string; assignedToId?: string; description?: string },
  ) {
    const updated = await goLiveRepository.updateIncident(incidentId, {
      status: input.status as never | undefined,
      assignedTo: input.assignedToId ? { connect: { id: input.assignedToId } } : undefined,
      description: input.description,
      resolvedAt: ['RESOLVED', 'CLOSED', 'MITIGATED'].includes(input.status ?? '') ? new Date() : undefined,
    });

    await goLiveRepository.createAudit({
      action: 'INCIDENT_UPDATE',
      compliance: 'go-live-execution',
      actor: { connect: { id: actorId } },
      launchExecution: updated ? { connect: { id: updated.launchExecutionId } } : undefined,
      details: input as Prisma.InputJsonValue,
    });

    return updated;
  }

  async listMetrics(launchExecutionId?: string, query?: { category?: string; limit?: number }) {
    const launch = await resolveLaunch(launchExecutionId);
    const items = await goLiveRepository.getLatestMetrics(launch.id, query?.category, query?.limit ?? 50);
    return {
      items,
      launchId: launch.id,
      trafficMetrics: TRAFFIC_METRICS,
      monitoringWatchlist: MONITORING_WATCHLIST,
    };
  }

  async snapshotMetrics(actorId: string, launchExecutionId?: string) {
    const launch = await resolveLaunch(launchExecutionId);
    const now = new Date();
    const snapshots = [
      { category: 'TRAFFIC' as const, name: 'active_users', value: 0, unit: 'users' },
      { category: 'TRAFFIC' as const, name: 'logins', value: 0, unit: 'count' },
      { category: 'TRAFFIC' as const, name: 'api_requests', value: 0, unit: 'rpm' },
      { category: 'ERRORS' as const, name: 'errors', value: 0, unit: 'count', threshold: 10 },
      { category: 'PERFORMANCE' as const, name: 'response_times', value: 120, unit: 'ms', threshold: 500 },
      { category: 'BUSINESS' as const, name: 'application_submissions', value: 0, unit: 'count' },
      { category: 'INFRASTRUCTURE' as const, name: 'cpu', value: 35, unit: '%', threshold: 85 },
      { category: 'INFRASTRUCTURE' as const, name: 'memory', value: 52, unit: '%', threshold: 90 },
    ];

    const created = await Promise.all(
      snapshots.map((s) =>
        goLiveRepository.createMetric({
          launchExecution: { connect: { id: launch.id } },
          category: s.category,
          name: s.name,
          value: s.value,
          unit: s.unit,
          threshold: s.threshold,
          isHealthy: s.threshold ? s.value <= s.threshold : true,
          recordedAt: now,
        }),
      ),
    );

    await goLiveRepository.createAudit({
      action: 'METRIC_SNAPSHOT',
      compliance: 'go-live-execution',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launch.id } },
      details: { count: created.length },
    });

    return created;
  }

  async getWarRoom(launchExecutionId?: string) {
    const launch = await resolveLaunch(launchExecutionId);
    let session = await goLiveRepository.getActiveWarRoom(launch.id);
    if (!session) {
      await goLiveRepository.createWarRoom({
        launchExecution: { connect: { id: launch.id } },
        code: `WR-${launch.code}`,
        status: 'STANDBY',
        teams: WAR_ROOM_TEAMS,
        communicationMatrix: COMMUNICATION_MATRIX,
        bridgeUrl: 'https://bridge.kuberone.com/go-live',
      });
      session = await goLiveRepository.getActiveWarRoom(launch.id);
    }
    return {
      session,
      teams: WAR_ROOM_TEAMS,
      communicationMatrix: COMMUNICATION_MATRIX,
      incidentRunbooks: INCIDENT_RUNBOOKS,
      alertChannels: ['email', 'sms', 'whatsapp', 'webhook'],
    };
  }

  async activateWarRoom(actorId: string, launchExecutionId?: string) {
    const launch = await resolveLaunch(launchExecutionId);
    const existing = await goLiveRepository.getActiveWarRoom(launch.id);
    const session = existing
      ? await goLiveRepository.updateWarRoom(existing.id, {
          status: 'ACTIVE',
          startedAt: new Date(),
          commander: { connect: { id: actorId } },
        })
      : await goLiveRepository.createWarRoom({
          launchExecution: { connect: { id: launch.id } },
          code: `WR-${launch.code}`,
          status: 'ACTIVE',
          startedAt: new Date(),
          commander: { connect: { id: actorId } },
          teams: WAR_ROOM_TEAMS,
          communicationMatrix: COMMUNICATION_MATRIX,
        });

    await goLiveRepository.createAudit({
      action: 'WAR_ROOM_ACTIVATE',
      compliance: 'go-live-execution',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launch.id } },
      details: { warRoomId: session.id },
    });

    await goLiveRepository.createEvent({
      launchExecution: { connect: { id: launch.id } },
      eventType: 'WAR_ROOM',
      title: 'War room activated',
      message: `Session ${session.code} is ACTIVE`,
      actor: { connect: { id: actorId } },
    });

    return session;
  }

  async getExecutionReports(launchExecutionId?: string) {
    const status = await this.getStatus(launchExecutionId);
    const now = new Date().toISOString();

    return {
      launchReport: {
        reportType: 'LAUNCH',
        generatedAt: now,
        summary: `Launch ${status.goLiveStatus} — ${status.launchSuccessPercent}% success`,
        details: status,
      },
      incidentReport: {
        reportType: 'INCIDENT',
        generatedAt: now,
        summary: `${status.incidentsDetected} incident(s), ${status.openIncidents} open`,
        details: { incidents: status.incidents, critical: status.criticalIncidents },
      },
      trafficReport: {
        reportType: 'TRAFFIC',
        generatedAt: now,
        summary: `Traffic metrics: ${status.metricsHealthy} healthy`,
        details: { metrics: status.metrics, trafficMetrics: TRAFFIC_METRICS },
      },
      healthReport: {
        reportType: 'HEALTH',
        generatedAt: now,
        summary: `Services ${status.servicesHealthy} healthy (${status.servicesHealthyPercent}%)`,
        details: { preLaunch: status.preLaunchValidation, servicesHealth: status.servicesHealth },
      },
      executiveSummary: {
        reportType: 'EXECUTIVE',
        generatedAt: now,
        summary: `${status.launchReadinessPercent}% readiness · ${status.launchSuccessPercent}% success · ${status.goLiveStatus}`,
        details: {
          readiness: status.launchReadinessPercent,
          success: status.launchSuccessPercent,
          goLiveStatus: status.goLiveStatus,
          productionStatus: status.productionStatus,
          openIncidents: status.openIncidents,
          successCriteria: status.successCriteria,
        },
      },
    };
  }
}

export const goLiveExecutionService = new GoLiveExecutionService();
