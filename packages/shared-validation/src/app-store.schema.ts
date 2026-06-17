import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const appStoreApps = ['CUSTOMER', 'DSA'] as const;
export const appStoreTracks = ['TESTFLIGHT_INTERNAL', 'TESTFLIGHT_EXTERNAL', 'APP_STORE'] as const;
export const appStoreReleaseStatuses = [
  'DRAFT', 'PROCESSING', 'IN_REVIEW', 'READY_FOR_SALE', 'PHASED_RELEASE', 'REJECTED', 'REMOVED',
] as const;
export const appStoreReportTypes = [
  'STORE_READINESS', 'COMPLIANCE', 'REVIEW_READINESS', 'RELEASE', 'LAUNCH', 'PRE_SUBMISSION',
] as const;

export const listAppStoreReleasesQuerySchema = paginationSchema.extend({
  app: z.enum(appStoreApps).optional(),
  track: z.enum(appStoreTracks).optional(),
  status: z.enum(appStoreReleaseStatuses).optional(),
});

export const createAppStoreReleaseSchema = z.object({
  app: z.enum(appStoreApps),
  versionName: z.string().regex(/^\d+\.\d+\.\d+$/),
  buildNumber: z.string().max(32),
  track: z.enum(appStoreTracks).default('TESTFLIGHT_INTERNAL'),
  releaseNotes: z.string().max(5000).optional(),
  phasedRelease: z.boolean().optional(),
});

export const appStoreWebhookSchema = z.object({
  app: z.enum(['customer', 'dsa', 'CUSTOMER', 'DSA']),
  versionName: z.string().max(32),
  buildNumber: z.string().max(32),
  track: z.enum([
    'testflight_internal', 'testflight_external', 'app_store',
    'TESTFLIGHT_INTERNAL', 'TESTFLIGHT_EXTERNAL', 'APP_STORE',
  ]),
  status: z.enum(appStoreReleaseStatuses).optional(),
  ipaArtifactUrl: z.string().url().optional(),
  releaseNotes: z.string().max(5000).optional(),
  commitSha: z.string().max(64).optional(),
});
