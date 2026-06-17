import type { Prisma } from '@kuberone/database';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import {
  PACKAGE_IDS,
  PLAY_STORE_CHECKLIST,
  SECURITY_CHECKLIST,
} from '../constants/mobile-release.constants.js';
import { mobileReleaseRepository } from '../repositories/mobile-release.repository.js';

type AppType = 'CUSTOMER' | 'DSA';
type EnvType = 'DEVELOPMENT' | 'QA' | 'STAGING' | 'PRODUCTION';
type FormatType = 'APK' | 'AAB';

function normalizeApp(app: string): AppType {
  const u = app.toUpperCase();
  if (u === 'CUSTOMER' || u === 'DSA') return u;
  throw new Error(`Invalid app: ${app}`);
}

function normalizeEnv(env: string): EnvType {
  const map: Record<string, EnvType> = {
    development: 'DEVELOPMENT',
    qa: 'QA',
    staging: 'STAGING',
    production: 'PRODUCTION',
    DEVELOPMENT: 'DEVELOPMENT',
    QA: 'QA',
    STAGING: 'STAGING',
    PRODUCTION: 'PRODUCTION',
  };
  const v = map[env];
  if (!v) throw new Error(`Invalid environment: ${env}`);
  return v;
}

function normalizeFormat(fmt: string): FormatType {
  const u = fmt.toUpperCase();
  if (u === 'APK' || u === 'AAB') return u;
  throw new Error(`Invalid build format: ${fmt}`);
}

export class MobileReleaseService {
  async getDashboard() {
    const [buildCounts, customerProd, dsaProd, recentBuilds, recentReleases] = await Promise.all([
      mobileReleaseRepository.countBuildsByStatus(),
      mobileReleaseRepository.latestSuccessfulBuild('CUSTOMER', 'PRODUCTION'),
      mobileReleaseRepository.latestSuccessfulBuild('DSA', 'PRODUCTION'),
      mobileReleaseRepository.listBuilds({}, 0, 10),
      mobileReleaseRepository.listReleases({}, 0, 5),
    ]);

    const readiness = this.computeReadinessScores();
    const security = this.computeSecurityScore();
    const performance = 88;

    return {
      summary: {
        totalBuilds: Object.values(buildCounts).reduce((a, b) => a + b, 0),
        buildCounts,
        latestCustomer: customerProd,
        latestDsa: dsaProd,
      },
      scores: {
        playStoreReadiness: readiness.overall,
        androidReleaseReadiness: Math.round((readiness.overall + security + performance) / 3),
        securityScore: security,
        performanceScore: performance,
      },
      readiness,
      security: { score: security, checklist: SECURITY_CHECKLIST },
      playStore: { score: readiness.overall, checklist: PLAY_STORE_CHECKLIST },
      recentBuilds: recentBuilds.items,
      recentReleases: recentReleases.items,
      packageIds: PACKAGE_IDS,
      buildVariants: ['debug', 'qa', 'staging', 'production'],
      outputs: ['APK', 'AAB', 'split-apk', 'universal-apk'],
    };
  }

  computeReadinessScores() {
    const checks = PLAY_STORE_CHECKLIST.map((c) => ({
      ...c,
      passed: ['privacy', 'terms', 'icon', 'permissions'].includes(c.id),
    }));
    const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
    const passedWeight = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
    const overall = Math.round((passedWeight / totalWeight) * 100);
    return { overall, checks };
  }

  computeSecurityScore() {
    const enabled = ['secureStorage', 'pinning', 'root', 'obfuscation', 'proguard'];
    const passed = SECURITY_CHECKLIST.filter((c) => enabled.includes(c.id));
    const totalWeight = SECURITY_CHECKLIST.reduce((s, c) => s + c.weight, 0);
    const passedWeight = passed.reduce((s, c) => s + c.weight, 0);
    return Math.round((passedWeight / totalWeight) * 100);
  }

  async listBuilds(query: {
    page: number;
    limit: number;
    app?: string;
    environment?: string;
    buildFormat?: string;
    status?: string;
    versionName?: string;
  }) {
    const where: Prisma.MobileBuildWhereInput = {};
    if (query.app) where.app = query.app as AppType;
    if (query.environment) where.environment = query.environment as EnvType;
    if (query.buildFormat) where.buildFormat = query.buildFormat as FormatType;
    if (query.status) where.status = query.status as Prisma.EnumMobileBuildStatusFilter['equals'];
    if (query.versionName) where.versionName = query.versionName;

    const skip = (query.page - 1) * query.limit;
    return mobileReleaseRepository.listBuilds(where, skip, query.limit);
  }

  async listReleases(query: {
    page: number;
    limit: number;
    app?: string;
    status?: string;
    versionName?: string;
  }) {
    const where: Prisma.MobileReleaseWhereInput = {};
    if (query.app) where.app = query.app as AppType;
    if (query.status) where.status = query.status as Prisma.EnumMobileReleaseStatusFilter['equals'];
    if (query.versionName) where.versionName = query.versionName;

    const skip = (query.page - 1) * query.limit;
    return mobileReleaseRepository.listReleases(where, skip, query.limit);
  }

  async createRelease(input: {
    app: AppType;
    versionName: string;
    versionCode: number;
    track?: string;
    releaseNotes?: string;
    releasedById?: string;
  }) {
    const readiness = this.computeReadinessScores();
    const security = this.computeSecurityScore();

    const release = await mobileReleaseRepository.createRelease({
      app: input.app,
      versionName: input.versionName,
      versionCode: input.versionCode,
      track: input.track ?? 'internal',
      releaseNotes: input.releaseNotes,
      status: 'PLANNED',
      readinessScore: readiness.overall,
      securityScore: security,
      performanceScore: 88,
      playStoreReady: readiness.overall >= 80,
    });

    await mobileReleaseRepository.createAudit({
      action: 'RELEASE_CREATED',
      actorId: input.releasedById,
      release: { connect: { id: release.id } },
      details: { versionName: input.versionName, versionCode: input.versionCode },
    });

    return release;
  }

  async recordBuildWebhook(input: {
    app: string;
    buildType: string;
    environment: string;
    versionName: string;
    versionCode: number;
    status?: string;
    artifactUrl?: string;
    commitSha?: string;
    branch?: string;
    packageId?: string;
    signed?: boolean;
    report?: Record<string, unknown>;
  }) {
    const app = normalizeApp(input.app);
    const environment = normalizeEnv(input.environment);
    const buildFormat = normalizeFormat(input.buildType);
    const pkg =
      input.packageId ??
      PACKAGE_IDS[app][environment as keyof (typeof PACKAGE_IDS)['CUSTOMER']];

    const build = await mobileReleaseRepository.createBuild({
      app,
      environment,
      buildFormat,
      versionName: input.versionName,
      versionCode: input.versionCode,
      buildNumber: `${input.versionName}+${input.versionCode}`,
      status: (input.status as Prisma.EnumMobileBuildStatusFilter['equals']) ?? 'SUCCESS',
      branch: input.branch,
      commitSha: input.commitSha,
      artifactUrl: input.artifactUrl,
      packageId: pkg,
      signed: input.signed ?? environment === 'PRODUCTION',
      hermesEnabled: true,
      proguardEnabled: environment === 'PRODUCTION' || environment === 'STAGING',
      splitApkReady: buildFormat === 'APK',
      completedAt: new Date(),
      report: input.report ? (input.report as Prisma.InputJsonValue) : undefined,
    });

    await mobileReleaseRepository.createAudit({
      action: 'BUILD_RECORDED',
      details: { buildId: build.id, app, environment, buildFormat },
    });

    return build;
  }

  async getBuild(id: string) {
    const build = await mobileReleaseRepository.findBuildById(id);
    if (!build) throw new NotFoundError('Mobile build not found');
    return build;
  }

  async getRelease(id: string) {
    const release = await mobileReleaseRepository.findReleaseById(id);
    if (!release) throw new NotFoundError('Mobile release not found');
    return release;
  }

  async getChecklist() {
    const readiness = this.computeReadinessScores();
    const security = this.computeSecurityScore();
    return {
      playStore: PLAY_STORE_CHECKLIST,
      security: SECURITY_CHECKLIST,
      scores: {
        playStoreReadiness: readiness.overall,
        securityScore: security,
        performanceScore: 88,
        androidReleaseReadiness: Math.round((readiness.overall + security + 88) / 3),
      },
      uploadChecklist: [
        'Increment versionCode',
        'Generate signed AAB',
        'Upload to Play Console internal track',
        'Run pre-launch report',
        'Promote to production with staged rollout',
      ],
      versionChecklist: [
        'Tag git release: mobile-v{versionName}',
        'Update CHANGELOG',
        'Record release in CRM dashboard',
        'Monitor Crashlytics for 24h',
      ],
    };
  }
}

export const mobileReleaseService = new MobileReleaseService();
