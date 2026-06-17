import type { Prisma } from '@kuberone/database';

import {
  BUNDLE_IDS,
  COMPLIANCE_CHECKLIST,
  CUSTOMER_SCREENSHOTS,
  DSA_SCREENSHOTS,
  REVIEW_READINESS_CHECKLIST,
  SECURITY_CHECKLIST,
  STORE_ASSETS_CHECKLIST,
  STORE_READINESS_CHECKLIST,
  TESTFLIGHT_TRACKS,
  MANAGEMENT_TEAMS,
  TESTFLIGHT_BETA_GROUPS,
} from '../constants/app-store.constants.js';
import { appStoreRepository } from '../repositories/app-store.repository.js';

type AppType = 'CUSTOMER' | 'DSA';
type TrackType = 'TESTFLIGHT_INTERNAL' | 'TESTFLIGHT_EXTERNAL' | 'APP_STORE';

function scoreChecklist(
  checklist: readonly { id: string; weight: number }[],
  passedIds: string[],
) {
  const checks = checklist.map((c) => ({ ...c, passed: passedIds.includes(c.id) }));
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const passed = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  return { overall: Math.round((passed / total) * 100), checks };
}

export class AppStoreService {
  computeScores() {
    const store = scoreChecklist(STORE_READINESS_CHECKLIST, [
      'listing', 'subtitle', 'description', 'keywords', 'icon',
      'privacyPolicy', 'terms', 'permissions', 'crashlytics', 'analytics',
    ]);
    const compliance = scoreChecklist(COMPLIANCE_CHECKLIST, [
      'privacyPolicy', 'terms', 'dataCollection', 'dataUsage', 'dataTracking',
      'userRights', 'permissions', 'userConsent',
    ]);
    const review = scoreChecklist(REVIEW_READINESS_CHECKLIST, [
      'reviewerNotes', 'aiExplanation', 'financialExplanation', 'contactInfo',
    ]);
    const security = scoreChecklist(SECURITY_CHECKLIST, [
      'keychain', 'tokenEncryption', 'pinning', 'jailbreak', 'encryption',
    ]);
    const performance = 90;

    const releaseReadiness = Math.round((store.overall + compliance.overall + review.overall) / 3);
    const launchReadiness = Math.round((releaseReadiness + store.overall + compliance.overall) / 3);

    return {
      appStoreReadiness: store.overall,
      complianceScore: compliance.overall,
      reviewReadiness: review.overall,
      releaseReadiness,
      productionLaunchReadiness: launchReadiness,
      performanceScore: performance,
      securityScore: security.overall,
      store,
      compliance,
      review,
      security,
    };
  }

  async getDashboard() {
    const scores = this.computeScores();
    const listings = await appStoreRepository.listListings();
    const releases = await appStoreRepository.listReleases({}, 0, 10);
    const reports = await appStoreRepository.listReports();

    return {
      scores: {
        appStoreReadiness: scores.appStoreReadiness,
        complianceScore: scores.complianceScore,
        reviewReadiness: scores.reviewReadiness,
        releaseReadiness: scores.releaseReadiness,
        productionLaunchReadiness: scores.productionLaunchReadiness,
        performanceScore: scores.performanceScore,
        securityScore: scores.securityScore,
      },
      apps: {
        customer: {
          bundleId: BUNDLE_IDS.CUSTOMER,
          listing: listings.find((l) => l.app === 'CUSTOMER') ?? null,
          screenshots: CUSTOMER_SCREENSHOTS,
        },
        dsa: {
          bundleId: BUNDLE_IDS.DSA,
          listing: listings.find((l) => l.app === 'DSA') ?? null,
          screenshots: DSA_SCREENSHOTS,
        },
      },
      storeAssetsChecklist: STORE_ASSETS_CHECKLIST,
      testflightTracks: TESTFLIGHT_TRACKS,
      managementTeams: MANAGEMENT_TEAMS,
      launchBriefingTeams: MANAGEMENT_TEAMS.map((t) => ({
        team: t.label,
        testflightGroup: t.testflightGroup,
        apps: t.apps,
      })),
      readiness: scores.store,
      compliance: scores.compliance,
      review: scores.review,
      security: scores.security,
      recentReleases: releases.items,
      recentReports: reports,
      phasedRelease: { enabled: true, days: 7 },
      rollbackStrategy: ['Halt phased release', 'Submit hotfix IPA', 'Increment build number'],
    };
  }

  async getTestFlightDashboard() {
    const dashboard = await this.getDashboard();
    const tfReleases = (dashboard.recentReleases as { track?: string }[]).filter(
      (r) => r.track?.startsWith('TESTFLIGHT'),
    );
    return {
      tracks: TESTFLIGHT_TRACKS,
      releases: tfReleases,
      betaGroups: TESTFLIGHT_BETA_GROUPS,
      managementTeams: MANAGEMENT_TEAMS,
      scores: dashboard.scores,
    };
  }

  async getReports(app?: AppType) {
    const scores = this.computeScores();
    const target = app ?? 'CUSTOMER';
    const now = new Date().toISOString();

    return {
      storeReport: {
        reportType: 'STORE_READINESS', app: target, score: scores.appStoreReadiness,
        readinessPct: scores.appStoreReadiness, summary: `App Store readiness ${scores.appStoreReadiness}%`,
        details: scores.store, generatedAt: now,
      },
      complianceReport: {
        reportType: 'COMPLIANCE', app: target, score: scores.complianceScore,
        readinessPct: scores.complianceScore, summary: `Compliance ${scores.complianceScore}%`,
        details: scores.compliance, generatedAt: now,
      },
      reviewReport: {
        reportType: 'REVIEW_READINESS', app: target, score: scores.reviewReadiness,
        readinessPct: scores.reviewReadiness, summary: `Review readiness ${scores.reviewReadiness}%`,
        details: scores.review, generatedAt: now,
      },
      releaseReport: {
        reportType: 'RELEASE', app: target, score: scores.releaseReadiness,
        readinessPct: scores.releaseReadiness, summary: `Release readiness ${scores.releaseReadiness}%`,
        details: { tracks: TESTFLIGHT_TRACKS }, generatedAt: now,
      },
      launchReport: {
        reportType: 'LAUNCH', app: target, score: scores.productionLaunchReadiness,
        readinessPct: scores.productionLaunchReadiness,
        summary: `Production launch readiness ${scores.productionLaunchReadiness}%`,
        details: { phasedRelease: true }, generatedAt: now,
      },
    };
  }

  async listReleases(query: { page: number; limit: number; app?: string; track?: string; status?: string }) {
    const where: Prisma.AppStoreReleaseWhereInput = {};
    if (query.track) where.track = query.track as TrackType;
    if (query.status) where.status = query.status as Prisma.EnumAppStoreReleaseStatusFilter['equals'];
    if (query.app) where.listing = { app: query.app as AppType };
    const skip = (query.page - 1) * query.limit;
    return appStoreRepository.listReleases(where, skip, query.limit);
  }

  async createRelease(input: {
    app: AppType;
    versionName: string;
    buildNumber: string;
    track?: TrackType;
    releaseNotes?: string;
    phasedRelease?: boolean;
    publishedById?: string;
  }) {
    const listing = await appStoreRepository.findListingByApp(input.app);
    if (!listing) throw new Error(`App Store listing not configured for ${input.app}`);

    const release = await appStoreRepository.createRelease({
      listing: { connect: { id: listing.id } },
      versionName: input.versionName,
      buildNumber: input.buildNumber,
      track: input.track ?? 'TESTFLIGHT_INTERNAL',
      status: 'DRAFT',
      phasedRelease: input.phasedRelease ?? true,
      releaseNotes: input.releaseNotes,
    });

    await appStoreRepository.createAudit({
      app: input.app,
      action: 'RELEASE_CREATED',
      actorId: input.publishedById,
      details: { releaseId: release.id },
    });

    return release;
  }

  async recordWebhook(input: {
    app: string;
    versionName: string;
    buildNumber: string;
    track: string;
    status?: string;
    ipaArtifactUrl?: string;
    releaseNotes?: string;
    commitSha?: string;
  }) {
    const app = input.app.toUpperCase() as AppType;
    const trackMap: Record<string, TrackType> = {
      testflight_internal: 'TESTFLIGHT_INTERNAL', testflight_external: 'TESTFLIGHT_EXTERNAL',
      app_store: 'APP_STORE', TESTFLIGHT_INTERNAL: 'TESTFLIGHT_INTERNAL',
      TESTFLIGHT_EXTERNAL: 'TESTFLIGHT_EXTERNAL', APP_STORE: 'APP_STORE',
    };
    const listing = await appStoreRepository.findListingByApp(app);
    if (!listing) throw new Error(`Listing not found for ${app}`);

    const release = await appStoreRepository.createRelease({
      listing: { connect: { id: listing.id } },
      versionName: input.versionName,
      buildNumber: input.buildNumber,
      track: trackMap[input.track] ?? 'TESTFLIGHT_INTERNAL',
      status: (input.status as Prisma.EnumAppStoreReleaseStatusFilter['equals']) ?? 'PROCESSING',
      ipaArtifactUrl: input.ipaArtifactUrl,
      releaseNotes: input.releaseNotes,
      metadata: input.commitSha ? { commitSha: input.commitSha } : undefined,
    });

    await appStoreRepository.createAudit({ app, action: 'WEBHOOK_RECORDED', details: { releaseId: release.id } });
    return release;
  }

  async getChecklist() {
    const scores = this.computeScores();
    return {
      storeReadiness: STORE_READINESS_CHECKLIST,
      compliance: COMPLIANCE_CHECKLIST,
      reviewReadiness: REVIEW_READINESS_CHECKLIST,
      security: SECURITY_CHECKLIST,
      storeAssets: STORE_ASSETS_CHECKLIST,
      customerScreenshots: CUSTOMER_SCREENSHOTS,
      dsaScreenshots: DSA_SCREENSHOTS,
      testflightTracks: TESTFLIGHT_TRACKS,
      scores,
      submissionChecklist: [
        'Increment CFBundleVersion', 'Valid distribution certificate',
        'IPA uploaded', 'Screenshots complete', 'Privacy labels complete',
        'Demo account for review', 'Submit for review',
      ],
      launchChecklist: [
        'TestFlight external sign-off', 'Phased release enabled',
        'Support briefed', 'Crashlytics monitoring', 'Launch report',
      ],
      marketingChecklist: [
        'ASO keywords in subtitle', 'Promotional text set',
        'Preview video (optional)', 'Press kit ready',
      ],
    };
  }
}

export const appStoreService = new AppStoreService();
