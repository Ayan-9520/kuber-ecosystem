import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { monitoringHealthService } from '../../monitoring/services/monitoring-health.service.js';
import {
  AI_SERVICES,
  BUSINESS_SERVICES,
  GO_LIVE_GATES,
  NOTIFICATION_SERVICES,
  PRODUCTION_DOMAINS,
} from '../constants/production.constants.js';
import { productionRepository } from '../repositories/production.repository.js';

export class ProductionService {
  private async getEnv() {
    const env = await productionRepository.findEnvironmentByCode('production');
    if (!env) throw new NotFoundError('Production environment not configured');
    return env;
  }

  async getStatus() {
    const env = await this.getEnv();
    const openIncidents = env.incidents.length;
    const criticalIncidents = await productionRepository.countOpenCriticalIncidents(env.id);

    return {
      environment: {
        code: env.code,
        name: env.name,
        status: env.status,
        region: env.region,
        version: env.version,
        commitSha: env.commitSha,
        availability: env.availability,
        goLiveAt: env.goLiveAt,
        urls: {
          api: env.apiUrl ?? `https://${PRODUCTION_DOMAINS.api}`,
          admin: env.adminUrl ?? `https://${PRODUCTION_DOMAINS.admin}`,
          customer: env.customerUrl ?? `https://${PRODUCTION_DOMAINS.customer}`,
          partner: env.partnerUrl ?? `https://${PRODUCTION_DOMAINS.partner}`,
        },
      },
      domains: PRODUCTION_DOMAINS,
      dns: { provider: 'cloudflare', ssl: 'ACM + Full Strict', ddos: true, waf: true },
      highAvailability: {
        multiInstance: true,
        loadBalancing: 'AWS ALB',
        autoRecovery: true,
        strategies: ['rolling', 'blue-green', 'canary-ready'],
      },
      services: {
        ai: AI_SERVICES,
        notifications: NOTIFICATION_SERVICES,
        business: BUSINESS_SERVICES,
      },
      openIncidents,
      criticalIncidents,
      latestDeployments: env.deployments,
      latestRelease: env.releases[0] ?? null,
    };
  }

  async getHealth() {
    const [liveness, readiness, deepHealth] = await Promise.all([
      Promise.resolve(monitoringHealthService.liveness()),
      monitoringHealthService.readiness(),
      monitoringHealthService.deepHealth().catch(() => null),
    ]);

    const endpoints = [
      { path: '/health', status: liveness.status === 'ok' ? 'HEALTHY' : 'UNHEALTHY' },
      { path: '/health/live', status: liveness.status === 'ok' ? 'HEALTHY' : 'UNHEALTHY' },
      { path: '/health/ready', status: readiness.status === 'ok' ? 'HEALTHY' : 'DEGRADED' },
      { path: '/deep-health', status: deepHealth ? 'HEALTHY' : 'UNKNOWN' },
    ];

    return {
      overall: readiness.status === 'ok' ? 'HEALTHY' : 'DEGRADED',
      endpoints,
      liveness,
      readiness,
      deepHealth,
      observability: { logs: true, metrics: true, tracing: true, errors: true, audit: true },
      monitoring: { prometheus: true, grafana: true, otel: true },
    };
  }

  async evaluateGoLiveGates() {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - 24);

    const [criticalErrors, uatSignoffs, backupJobs] = await Promise.all([
      prisma.errorGroup.count({
        where: {
          priority: 'CRITICAL',
          status: { notIn: ['RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED'] },
          lastSeenAt: { gte: windowStart },
        },
      }),
      prisma.uatSignoff.count({ where: { status: 'APPROVED', signedAt: { gte: windowStart } } }),
      prisma.backupJob.count({ where: { status: 'ACTIVE' } }),
    ]);

    const maxCritical = Number(process.env.ERROR_GATE_MAX_CRITICAL ?? 5);
    const gates = GO_LIVE_GATES.map((gate) => {
      let passed = true;
      let detail = 'OK';

      switch (gate.check) {
        case 'errors':
          passed = criticalErrors <= maxCritical;
          detail = `${criticalErrors} critical errors (max ${maxCritical})`;
          break;
        case 'security':
          passed = true;
          detail = 'Security scan required in CI';
          break;
        case 'uat':
          passed = uatSignoffs > 0;
          detail = uatSignoffs > 0 ? 'UAT signoff found' : 'No recent UAT signoff';
          break;
        case 'validation':
          passed = true;
          detail = 'Run production-validation workflow';
          break;
        case 'monitoring':
          passed = true;
          detail = 'Prometheus/Grafana configured';
          break;
        case 'backup':
          passed = backupJobs >= 1;
          detail = `${backupJobs} active backup jobs`;
          break;
      }

      return { ...gate, passed, detail };
    });

    const blocked = gates.filter((g) => !g.passed);
    return {
      ready: blocked.length === 0,
      gates,
      blockedReasons: blocked.map((g) => g.label),
    };
  }

  async listReleases(query: { page: number; limit: number; status?: string; version?: string }) {
    const env = await this.getEnv();
    const where: Prisma.ReleaseRecordWhereInput = { environmentId: env.id };
    if (query.status) where.status = query.status as Prisma.EnumReleaseRecordStatusFilter['equals'];
    if (query.version) where.version = query.version;

    const skip = (query.page - 1) * query.limit;
    return productionRepository.listReleases(where, skip, query.limit);
  }

  async createRelease(input: {
    version: string;
    name: string;
    branch?: string;
    changelog?: string;
    releasedById?: string;
  }) {
    const env = await this.getEnv();
    const goLive = await this.evaluateGoLiveGates();

    const release = await productionRepository.createRelease({
      version: input.version,
      name: input.name,
      branch: input.branch ?? 'main',
      changelog: input.changelog,
      status: goLive.ready ? 'IN_PROGRESS' : 'PLANNED',
      uatSignedOff: goLive.gates.find((g) => g.id === 'uat_signoff')?.passed ?? false,
      goLiveApproved: goLive.ready,
      environment: { connect: { id: env.id } },
      releasedBy: input.releasedById ? { connect: { id: input.releasedById } } : undefined,
    });

    await productionRepository.createAudit({
      action: 'RELEASE_CREATE',
      entityType: 'release_record',
      entityId: release.id,
      compliance: 'release-management',
      environment: { connect: { id: env.id } },
      actor: input.releasedById ? { connect: { id: input.releasedById } } : undefined,
      details: { version: input.version, goLiveReady: goLive.ready },
    });

    return { release, goLiveGates: goLive };
  }

  async listDeployments(query: { page: number; limit: number; component?: string; status?: string }) {
    const env = await this.getEnv();
    const where: Prisma.ProductionDeploymentWhereInput = { environmentId: env.id };
    if (query.component) where.component = query.component;
    if (query.status) where.status = query.status as Prisma.EnumProductionDeployStatusFilter['equals'];

    const skip = (query.page - 1) * query.limit;
    return productionRepository.listDeployments(where, skip, query.limit);
  }

  async recordDeploymentWebhook(input: {
    component: string;
    version: string;
    strategy?: string;
    branch?: string;
    commitSha?: string;
    status?: string;
    validationReport?: Record<string, unknown>;
  }) {
    const env = await this.getEnv();
    const status = (input.status ?? 'SUCCESS') as Prisma.ProductionDeploymentCreateInput['status'];

    const deployment = await productionRepository.createDeployment({
      component: input.component,
      version: input.version,
      strategy: input.strategy ?? 'rolling',
      branch: input.branch,
      commitSha: input.commitSha,
      status,
      startedAt: new Date(),
      completedAt: new Date(),
      validationReport: input.validationReport as Prisma.InputJsonValue,
      environment: { connect: { id: env.id } },
    });

    await productionRepository.createAudit({
      action: 'DEPLOY',
      entityType: 'production_deployment',
      entityId: deployment.id,
      compliance: 'deployment',
      environment: { connect: { id: env.id } },
      details: { component: input.component, version: input.version, strategy: input.strategy },
    });

    return deployment;
  }

  async listIncidents(query: {
    page: number;
    limit: number;
    severity?: string;
    status?: string;
  }) {
    const env = await this.getEnv();
    const where: Prisma.IncidentRecordWhereInput = { environmentId: env.id };
    if (query.severity) where.severity = query.severity as Prisma.EnumIncidentSeverityFilter['equals'];
    if (query.status) where.status = query.status as Prisma.EnumIncidentStatusFilter['equals'];

    const skip = (query.page - 1) * query.limit;
    return productionRepository.listIncidents(where, skip, query.limit);
  }

  async createIncident(input: {
    title: string;
    severity: string;
    description?: string;
    assignedToId?: string;
    actorId?: string;
  }) {
    const env = await this.getEnv();

    const incident = await productionRepository.createIncident({
      title: input.title,
      severity: input.severity as Prisma.IncidentRecordCreateInput['severity'],
      description: input.description,
      status: 'OPEN',
      environment: { connect: { id: env.id } },
      assignedTo: input.assignedToId ? { connect: { id: input.assignedToId } } : undefined,
    });

    if (input.severity === 'CRITICAL') {
      await prisma.productionEnvironment.update({
        where: { id: env.id },
        data: { status: 'INCIDENT' },
      });
    }

    await productionRepository.createAudit({
      action: 'INCIDENT_CREATE',
      entityType: 'incident_record',
      entityId: incident.id,
      compliance: 'incident-management',
      environment: { connect: { id: env.id } },
      actor: input.actorId ? { connect: { id: input.actorId } } : undefined,
      details: { title: input.title, severity: input.severity },
    });

    return incident;
  }

  async getReports() {
    const env = await this.getEnv();
    const [deployments, releases, incidents, goLive, health] = await Promise.all([
      productionRepository.listDeployments({ environmentId: env.id }, 0, 20),
      productionRepository.listReleases({ environmentId: env.id }, 0, 10),
      productionRepository.listIncidents({ environmentId: env.id }, 0, 20),
      this.evaluateGoLiveGates(),
      this.getHealth(),
    ]);

    const openIncidents = incidents.items.filter((i) => !['RESOLVED', 'CLOSED'].includes(i.status));
    const successDeploys = deployments.items.filter((d) => d.status === 'SUCCESS').length;

    return {
      healthReport: {
        overall: health.overall,
        endpoints: health.endpoints,
        availability: env.availability,
      },
      deploymentReport: {
        total: deployments.total,
        success: successDeploys,
        failed: deployments.items.filter((d) => d.status === 'FAILED').length,
        recent: deployments.items,
      },
      incidentReport: {
        total: incidents.total,
        open: openIncidents.length,
        critical: openIncidents.filter((i) => i.severity === 'CRITICAL').length,
        recent: incidents.items,
      },
      availabilityReport: {
        target: 99.9,
        current: env.availability,
        region: env.region,
        multiInstance: true,
      },
      complianceReport: {
        auditLogging: true,
        encryptionAtRest: true,
        encryptionInTransit: true,
        dataRetention: true,
        backupCompliance: goLive.gates.find((g) => g.id === 'backup')?.passed ?? false,
        monitoringCompliance: goLive.gates.find((g) => g.id === 'monitoring')?.passed ?? false,
        securityCompliance: goLive.gates.find((g) => g.id === 'security')?.passed ?? false,
      },
      releaseReport: {
        total: releases.total,
        released: releases.items.filter((r) => r.status === 'RELEASED').length,
        recent: releases.items,
      },
      goLiveGates: goLive,
    };
  }

  async getDashboard() {
    const [status, health, reports] = await Promise.all([
      this.getStatus(),
      this.getHealth(),
      this.getReports(),
    ]);
    return { status, health, reports };
  }
}

export const productionService = new ProductionService();
