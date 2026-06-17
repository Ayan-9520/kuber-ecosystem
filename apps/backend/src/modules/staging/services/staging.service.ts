import type { Prisma } from '@kuberone/database';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { monitoringHealthService } from '../../monitoring/services/monitoring-health.service.js';
import {
  POST_DEPLOY_CHECKLIST,
  PRE_DEPLOY_CHECKLIST,
  ROLLBACK_CHECKLIST,
  STAGING_DOMAINS,
} from '../constants/staging.constants.js';
import { stagingRepository } from '../repositories/staging.repository.js';

type ValidationStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';

export class StagingService {
  async getStatus() {
    const env = await stagingRepository.findEnvironmentByCode('staging');
    if (!env) throw new NotFoundError('Staging environment not configured');

    const latestDeployments = env.deployments;
    const latestRelease = env.releaseValidations[0] ?? null;

    return {
      environment: {
        code: env.code,
        name: env.name,
        status: env.status,
        branch: env.branch,
        version: env.version,
        commitSha: env.commitSha,
        maskedData: env.maskedData,
        urls: {
          api: env.apiUrl ?? `https://${STAGING_DOMAINS.api}`,
          admin: env.adminUrl ?? `https://${STAGING_DOMAINS.admin}`,
          customer: env.customerUrl ?? `https://${STAGING_DOMAINS.customer}`,
          partner: env.partnerUrl ?? `https://${STAGING_DOMAINS.partner}`,
        },
        storage: { s3Bucket: env.s3Bucket, redis: !!env.redisUrl, database: !!env.databaseUrl },
      },
      latestDeployments,
      latestRelease,
      domains: STAGING_DOMAINS,
      purposes: ['testing', 'uat', 'release-validation', 'performance', 'security', 'deployment'],
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
      integrations: {
        monitoring: true,
        logging: true,
        tracing: true,
        errorTracking: true,
      },
    };
  }

  async listReleases(query: { page: number; limit: number; status?: string; releaseVersion?: string }) {
    const where: Prisma.ReleaseValidationWhereInput = {};
    if (query.status) where.status = query.status as Prisma.EnumReleaseValidationStatusFilter['equals'];
    if (query.releaseVersion) where.releaseVersion = query.releaseVersion;

    const staging = await stagingRepository.findEnvironmentByCode('staging');
    if (staging) where.environmentId = staging.id;

    const skip = (query.page - 1) * query.limit;
    return stagingRepository.listReleaseValidations(where, skip, query.limit);
  }

  async createReleaseValidation(input: {
    releaseVersion: string;
    branch?: string;
    validatedById?: string;
  }) {
    const env = await stagingRepository.findEnvironmentByCode('staging');
    if (!env) throw new NotFoundError('Staging environment not configured');

    const validation = await stagingRepository.createReleaseValidation({
      releaseVersion: input.releaseVersion,
      branch: input.branch ?? env.branch ?? 'staging',
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      checklist: {
        preDeploy: PRE_DEPLOY_CHECKLIST.map((item) => ({ item, checked: false })),
        postDeploy: POST_DEPLOY_CHECKLIST.map((item) => ({ item, checked: false })),
        rollback: ROLLBACK_CHECKLIST.map((item) => ({ item, checked: false })),
      },
      environment: { connect: { id: env.id } },
      validatedBy: input.validatedById ? { connect: { id: input.validatedById } } : undefined,
    });

    await stagingRepository.createAudit({
      action: 'RELEASE_VALIDATION_START',
      entityType: 'release_validation',
      entityId: validation.id,
      environment: { connect: { id: env.id } },
      actor: input.validatedById ? { connect: { id: input.validatedById } } : undefined,
      details: { releaseVersion: input.releaseVersion },
    });

    return validation;
  }

  async listDeployments(query: {
    page: number;
    limit: number;
    component?: string;
    status?: string;
  }) {
    const where: Prisma.EnvironmentDeploymentWhereInput = {};
    if (query.component) where.component = query.component;
    if (query.status) where.status = query.status as Prisma.EnumDeploymentValidationStatusFilter['equals'];

    const staging = await stagingRepository.findEnvironmentByCode('staging');
    if (staging) where.environmentId = staging.id;

    const skip = (query.page - 1) * query.limit;
    return stagingRepository.listDeployments(where, skip, query.limit);
  }

  async recordDeploymentWebhook(input: {
    component: string;
    version: string;
    branch?: string;
    commitSha?: string;
    buildStatus?: ValidationStatus;
    testStatus?: ValidationStatus;
    migrationStatus?: ValidationStatus;
    healthStatus?: ValidationStatus;
    report?: Record<string, unknown>;
  }) {
    const env = await stagingRepository.findEnvironmentByCode('staging');
    if (!env) throw new NotFoundError('Staging environment not configured');

    const statuses = [
      input.buildStatus,
      input.testStatus,
      input.migrationStatus,
      input.healthStatus,
    ].filter(Boolean) as ValidationStatus[];

    const overall: ValidationStatus = statuses.some((s) => s === 'FAILED')
      ? 'FAILED'
      : statuses.every((s) => s === 'PASSED' || s === 'SKIPPED')
        ? 'PASSED'
        : 'RUNNING';

    const deployment = await stagingRepository.createDeployment({
      component: input.component,
      version: input.version,
      branch: input.branch,
      commitSha: input.commitSha,
      status: overall,
      buildStatus: input.buildStatus ?? 'PENDING',
      testStatus: input.testStatus ?? 'PENDING',
      migrationStatus: input.migrationStatus ?? 'PENDING',
      healthStatus: input.healthStatus ?? 'PENDING',
      startedAt: new Date(),
      completedAt: overall === 'PASSED' || overall === 'FAILED' ? new Date() : undefined,
      report: input.report as Prisma.InputJsonValue,
      environment: { connect: { id: env.id } },
    });

    await stagingRepository.createAudit({
      action: 'DEPLOY',
      entityType: 'environment_deployment',
      entityId: deployment.id,
      environment: { connect: { id: env.id } },
      details: { component: input.component, version: input.version, status: overall },
    });

    return deployment;
  }

  async getReports() {
    const env = await stagingRepository.findEnvironmentByCode('staging');
    if (!env) throw new NotFoundError('Staging environment not configured');

    const [deployments, releases, audits] = await Promise.all([
      stagingRepository.listDeployments({ environmentId: env.id }, 0, 20),
      stagingRepository.listReleaseValidations({ environmentId: env.id }, 0, 10),
      stagingRepository.listAudits(env.id, 0, 20),
    ]);

    return {
      deploymentReport: {
        total: deployments.total,
        passed: deployments.items.filter((d) => d.status === 'PASSED').length,
        failed: deployments.items.filter((d) => d.status === 'FAILED').length,
        recent: deployments.items,
      },
      releaseReport: {
        total: releases.total,
        passed: releases.items.filter((r) => r.status === 'PASSED').length,
        inProgress: releases.items.filter((r) => r.status === 'IN_PROGRESS').length,
        recent: releases.items,
      },
      environmentReport: {
        code: env.code,
        status: env.status,
        version: env.version,
        branch: env.branch,
        maskedData: env.maskedData,
      },
      uatReport: {
        enabled: true,
        demoAccounts: ['admin@kuberfinserve.com', 'customer.demo@kuberone.com', 'dsa.demo@kuberone.com'],
        testWorkflows: ['lead-to-application', 'document-upload', 'commission-payout', 'uat-signoff'],
      },
      auditTrail: audits.items,
    };
  }

  async getDashboard() {
    const [status, health, reports] = await Promise.all([
      this.getStatus(),
      this.getHealth(),
      this.getReports(),
    ]);

    return { status, health, reports, checklists: { preDeploy: PRE_DEPLOY_CHECKLIST, postDeploy: POST_DEPLOY_CHECKLIST, rollback: ROLLBACK_CHECKLIST } };
  }
}

export const stagingService = new StagingService();
