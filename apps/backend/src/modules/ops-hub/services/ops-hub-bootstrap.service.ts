import { prisma } from '@kuberone/database';

import { PRODUCTION_DOMAINS } from '../../production/constants/production.constants.js';
import { STAGING_DOMAINS } from '../../staging/constants/staging.constants.js';

/** Ensures ops-hub modules have baseline data so admin pages load on fresh databases. */
export const opsHubBootstrapService = {
  async ensureStaging(): Promise<void> {
    const existing = await prisma.environment.findUnique({ where: { code: 'staging' } });
    if (existing) return;

    const env = await prisma.environment.create({
      data: {
        code: 'staging',
        name: 'KuberOne Staging',
        status: 'ACTIVE',
        apiUrl: `https://${STAGING_DOMAINS.api}`,
        adminUrl: `https://${STAGING_DOMAINS.admin}`,
        customerUrl: `https://${STAGING_DOMAINS.customer}`,
        partnerUrl: `https://${STAGING_DOMAINS.partner}`,
        branch: 'staging',
        version: '1.0.0-staging.1',
        commitSha: 'staging0000000000000000000000000000000000',
        maskedData: true,
        metadata: { bootstrapped: true, purposes: ['testing', 'uat', 'release-validation'] },
      },
    });

    await prisma.environmentDeployment.create({
      data: {
        environmentId: env.id,
        component: 'backend',
        version: '1.0.0-staging.1',
        branch: 'staging',
        status: 'PASSED',
        buildStatus: 'PASSED',
        testStatus: 'PASSED',
        migrationStatus: 'PASSED',
        healthStatus: 'PASSED',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });
  },

  async ensureProduction(): Promise<void> {
    const existing = await prisma.productionEnvironment.findUnique({ where: { code: 'production' } });
    if (existing) return;

    const env = await prisma.productionEnvironment.create({
      data: {
        code: 'production',
        name: 'KuberOne Production',
        status: 'LIVE',
        apiUrl: `https://${PRODUCTION_DOMAINS.api}`,
        adminUrl: 'https://kuberone.online',
        customerUrl: `https://${PRODUCTION_DOMAINS.customer}`,
        partnerUrl: `https://${PRODUCTION_DOMAINS.partner}`,
        region: 'ap-south-1',
        version: '1.0.0',
        commitSha: 'prod0000000000000000000000000000000000',
        availability: 99.9,
        metadata: { bootstrapped: true },
      },
    });

    await prisma.productionDeployment.create({
      data: {
        environmentId: env.id,
        component: 'backend',
        version: '1.0.0',
        strategy: 'rolling',
        branch: 'main',
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });
  },

  async ensureUatCycle(): Promise<string> {
    const active = await prisma.uatCycle.findFirst({
      where: { status: { in: ['IN_PROGRESS', 'PLANNED'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (active) return active.id;

    let plan = await prisma.uatPlan.findFirst({ where: { status: 'ACTIVE' } });
    if (!plan) {
      plan = await prisma.uatPlan.create({
        data: {
          code: 'UAT-KUBERONE-V1',
          name: 'KuberOne Enterprise UAT',
          description: 'Auto-bootstrapped UAT plan for admin readiness dashboards.',
          version: '1.0',
          status: 'ACTIVE',
          startDate: new Date(),
        },
      });
    }

    const cycle = await prisma.uatCycle.create({
      data: {
        code: 'UAT-CYCLE-001',
        name: 'UAT Cycle 1',
        description: 'Auto-bootstrapped UAT cycle.',
        status: 'IN_PROGRESS',
        startDate: new Date(),
        planId: plan.id,
      },
    });

    return cycle.id;
  },

  async ensureGoLiveLaunch(): Promise<string> {
    const existing = await prisma.launchExecution.findFirst({
      where: { status: { in: ['PLANNED', 'PRE_LAUNCH', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing.id;

    const launch = await prisma.launchExecution.create({
      data: {
        code: 'GO-LIVE-KUBERONE-V1',
        name: 'KuberOne Production Launch',
        status: 'PLANNED',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        readinessPct: 0,
        metadata: { bootstrapped: true },
      },
    });

    const approvalTypes = ['QA', 'SECURITY', 'DEVOPS', 'PRODUCT', 'MANAGEMENT', 'FINAL_RELEASE'] as const;
    for (const approvalType of approvalTypes) {
      await prisma.goLiveApproval.create({
        data: { launchExecutionId: launch.id, approvalType, status: 'PENDING' },
      });
    }

    await prisma.warRoomSession.create({
      data: {
        launchExecutionId: launch.id,
        code: `WR-${launch.code}`,
        status: 'STANDBY',
        teams: [
          { id: 'launch', label: 'Launch Team', role: 'Launch Director' },
          { id: 'engineering', label: 'Engineering Team', role: 'Principal SRE' },
        ],
        communicationMatrix: [],
      },
    });

    await prisma.launchEvent.create({
      data: {
        launchExecutionId: launch.id,
        eventType: 'SYSTEM',
        title: 'Go-Live command center initialized',
        message: 'Launch execution framework ready',
      },
    });

    return launch.id;
  },

  async ensureHypercareSession(): Promise<string> {
    const existing = await prisma.hypercareSession.findFirst({
      where: { status: { in: ['ACTIVE', 'EXTENDED'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing.id;

    const launchId = await this.ensureGoLiveLaunch().catch(() => undefined);

    const session = await prisma.hypercareSession.create({
      data: {
        code: 'HYPERCARE-KUBERONE-V1',
        name: 'KuberOne Post-Launch Hypercare',
        status: 'ACTIVE',
        phase: 'WEEK_1',
        weekNumber: 1,
        launchExecutionId: launchId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        stabilityPct: 80,
        adoptionPct: 65,
        resolutionPct: 70,
        performanceScore: 75,
        aiStabilityPct: 80,
        finalStatus: 'STABILIZING',
        metadata: { bootstrapped: true },
      },
    });

    await prisma.hypercareMetric.create({
      data: {
        sessionId: session.id,
        category: 'SYSTEM',
        name: 'system_health',
        value: 95,
        unit: '%',
        threshold: 90,
        isHealthy: true,
        recordedAt: new Date(),
      },
    });

    return session.id;
  },

  async ensureAll(): Promise<void> {
    await this.ensureStaging();
    await this.ensureProduction();
    await this.ensureUatCycle();
    await this.ensureGoLiveLaunch();
    await this.ensureHypercareSession();
  },
};
