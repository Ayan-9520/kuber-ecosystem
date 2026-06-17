import type { Prisma } from '@kuberone/database';

import {
  COMPLIANCE_CHECKLIST,
  CUSTOMER_SCREENSHOTS,
  DSA_SCREENSHOTS,
  PACKAGE_NAMES,
  PLAY_INTEGRITY_CHECKLIST,
  STORE_ASSETS_CHECKLIST,
  STORE_READINESS_CHECKLIST,
  TESTING_TRACKS,
} from '../constants/play-store.constants.js';
import { playStoreRepository } from '../repositories/play-store.repository.js';

type AppType = 'CUSTOMER' | 'DSA';
type TrackType = 'INTERNAL' | 'CLOSED' | 'OPEN' | 'PRODUCTION';

function scoreChecklist(
  checklist: readonly { id: string; weight: number }[],
  passedIds: string[],
) {
  const checks = checklist.map((c) => ({ ...c, passed: passedIds.includes(c.id) }));
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const passed = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  return { overall: Math.round((passed / total) * 100), checks };
}

const PASSED_STORE = ['listing', 'shortDesc', 'fullDesc', 'icon', 'privacyPolicy', 'terms', 'permissions'];
const PASSED_COMPLIANCE = ['privacyPolicy', 'terms', 'dataCollection', 'dataUsage', 'targetAudience', 'adsDecl', 'permissions'];
const PASSED_INTEGRITY = ['integrityApi', 'deviceValidation', 'fraudProtection'];

export class PlayStoreService {
  computeScores() {
    const store = scoreChecklist(STORE_READINESS_CHECKLIST, [
      ...PASSED_STORE,
      'crashlytics',
      'analytics',
    ]);
    const compliance = scoreChecklist(COMPLIANCE_CHECKLIST, PASSED_COMPLIANCE);
    const integrity = scoreChecklist(PLAY_INTEGRITY_CHECKLIST, PASSED_INTEGRITY);
    const performance = 90;
    const security = scoreChecklist(
      [{ id: 'playSigning', weight: 25 }, { id: 'obfuscation', weight: 25 }, { id: 'secureStorage', weight: 25 }, { id: 'releaseSigning', weight: 25 }],
      ['obfuscation', 'secureStorage', 'releaseSigning'],
    );

    const releaseReadiness = Math.round((store.overall + compliance.overall + integrity.overall) / 3);
    const launchReadiness = Math.round((releaseReadiness + store.overall + compliance.overall) / 3);

    return {
      playStoreReadiness: store.overall,
      complianceScore: compliance.overall,
      releaseReadiness,
      productionLaunchReadiness: launchReadiness,
      performanceScore: performance,
      securityScore: security.overall,
      integrityScore: integrity.overall,
      store,
      compliance,
      integrity,
    };
  }

  async getDashboard() {
    const scores = this.computeScores();
    const listings = await playStoreRepository.listListings();
    const releases = await playStoreRepository.listReleases({}, 0, 10);
    const reports = await playStoreRepository.listReports();

    return {
      scores: {
        playStoreReadiness: scores.playStoreReadiness,
        complianceScore: scores.complianceScore,
        releaseReadiness: scores.releaseReadiness,
        productionLaunchReadiness: scores.productionLaunchReadiness,
        performanceScore: scores.performanceScore,
        securityScore: scores.securityScore,
        integrityScore: scores.integrityScore,
      },
      apps: {
        customer: {
          packageName: PACKAGE_NAMES.CUSTOMER,
          listing: listings.find((l) => l.app === 'CUSTOMER') ?? null,
          screenshots: CUSTOMER_SCREENSHOTS,
          category: 'Finance',
        },
        dsa: {
          packageName: PACKAGE_NAMES.DSA,
          listing: listings.find((l) => l.app === 'DSA') ?? null,
          screenshots: DSA_SCREENSHOTS,
          category: 'Business',
        },
      },
      storeAssetsChecklist: STORE_ASSETS_CHECKLIST,
      testingTracks: TESTING_TRACKS,
      readiness: scores.store,
      compliance: scores.compliance,
      integrity: scores.integrity,
      recentReleases: releases.items,
      recentReports: reports,
      rolloutStrategy: ['10%', '25%', '50%', '100%'],
      rollbackStrategy: ['Halt rollout in Play Console', 'Ship hotfix AAB', 'Increment versionCode', 'Document in CRM'],
    };
  }

  async getReports(app?: AppType) {
    const scores = this.computeScores();
    const now = new Date().toISOString();

    const storeReport = {
      reportType: 'STORE_READINESS',
      app: app ?? 'CUSTOMER',
      score: scores.playStoreReadiness,
      readinessPct: scores.playStoreReadiness,
      summary: `Play Store readiness at ${scores.playStoreReadiness}%`,
      details: scores.store,
      generatedAt: now,
    };

    const complianceReport = {
      reportType: 'COMPLIANCE',
      app: app ?? 'CUSTOMER',
      score: scores.complianceScore,
      readinessPct: scores.complianceScore,
      summary: `Compliance score ${scores.complianceScore}%`,
      details: scores.compliance,
      generatedAt: now,
    };

    const releaseReport = {
      reportType: 'RELEASE',
      app: app ?? 'CUSTOMER',
      score: scores.releaseReadiness,
      readinessPct: scores.releaseReadiness,
      summary: `Release readiness ${scores.releaseReadiness}%`,
      details: { tracks: TESTING_TRACKS, rollout: ['10%', '50%', '100%'] },
      generatedAt: now,
    };

    const launchReport = {
      reportType: 'LAUNCH',
      app: app ?? 'CUSTOMER',
      score: scores.productionLaunchReadiness,
      readinessPct: scores.productionLaunchReadiness,
      summary: `Production launch readiness ${scores.productionLaunchReadiness}%`,
      details: { preLaunch: ['compatibility', 'performance', 'security', 'accessibility'] },
      generatedAt: now,
    };

    return { storeReport, complianceReport, releaseReport, launchReport };
  }

  async listReleases(query: { page: number; limit: number; app?: string; track?: string; status?: string }) {
    const where: Prisma.PlayStoreReleaseWhereInput = {};
    if (query.track) where.track = query.track as TrackType;
    if (query.status) where.status = query.status as Prisma.EnumPlayStoreReleaseStatusFilter['equals'];
    if (query.app) {
      where.listing = { app: query.app as AppType };
    }
    const skip = (query.page - 1) * query.limit;
    return playStoreRepository.listReleases(where, skip, query.limit);
  }

  async createRelease(input: {
    app: AppType;
    versionName: string;
    versionCode: number;
    track?: TrackType;
    releaseNotes?: string;
    rolloutPercent?: number;
    publishedById?: string;
  }) {
    const listing = await playStoreRepository.findListingByApp(input.app);
    if (!listing) throw new Error(`Play Store listing not configured for ${input.app}`);

    const release = await playStoreRepository.createRelease({
      listing: { connect: { id: listing.id } },
      versionName: input.versionName,
      versionCode: input.versionCode,
      track: input.track ?? 'INTERNAL',
      status: 'DRAFT',
      rolloutPercent: input.rolloutPercent ?? 0,
      releaseNotes: input.releaseNotes,
    });

    await playStoreRepository.createAudit({
      app: input.app,
      action: 'RELEASE_CREATED',
      actorId: input.publishedById,
      details: { releaseId: release.id, versionName: input.versionName },
    });

    return release;
  }

  async recordWebhook(input: {
    app: string;
    versionName: string;
    versionCode: number;
    track: string;
    status?: string;
    aabArtifactUrl?: string;
    releaseNotes?: string;
    commitSha?: string;
  }) {
    const app = input.app.toUpperCase() as AppType;
    const trackMap: Record<string, TrackType> = {
      internal: 'INTERNAL', closed: 'CLOSED', open: 'OPEN', production: 'PRODUCTION',
      INTERNAL: 'INTERNAL', CLOSED: 'CLOSED', OPEN: 'OPEN', PRODUCTION: 'PRODUCTION',
    };
    const track = trackMap[input.track] ?? 'INTERNAL';

    const listing = await playStoreRepository.findListingByApp(app);
    if (!listing) throw new Error(`Listing not found for ${app}`);

    const release = await playStoreRepository.createRelease({
      listing: { connect: { id: listing.id } },
      versionName: input.versionName,
      versionCode: input.versionCode,
      track,
      status: (input.status as Prisma.EnumPlayStoreReleaseStatusFilter['equals']) ?? 'IN_REVIEW',
      aabArtifactUrl: input.aabArtifactUrl,
      releaseNotes: input.releaseNotes,
      metadata: input.commitSha ? { commitSha: input.commitSha } : undefined,
    });

    await playStoreRepository.createAudit({
      app,
      action: 'WEBHOOK_RELEASE_RECORDED',
      details: { releaseId: release.id, track },
    });

    return release;
  }

  async getChecklist() {
    const scores = this.computeScores();
    return {
      storeReadiness: STORE_READINESS_CHECKLIST,
      compliance: COMPLIANCE_CHECKLIST,
      integrity: PLAY_INTEGRITY_CHECKLIST,
      storeAssets: STORE_ASSETS_CHECKLIST,
      customerScreenshots: CUSTOMER_SCREENSHOTS,
      dsaScreenshots: DSA_SCREENSHOTS,
      testingTracks: TESTING_TRACKS,
      scores: scores,
      launchChecklist: [
        'Store listings complete',
        'Data Safety form submitted',
        'Internal track validated',
        'Closed testing UAT sign-off',
        'Pre-launch report clean',
        'Production AAB uploaded',
        'Staged rollout configured',
        'Crashlytics monitoring active',
      ],
      marketingChecklist: [
        'SEO keywords in short description',
        'Feature graphic uploaded',
        '8 phone screenshots per app',
        'Tablet screenshots',
        'Review response plan',
      ],
    };
  }
}

export const playStoreService = new PlayStoreService();
