import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const playStoreApps = ['CUSTOMER', 'DSA'] as const;
export const playStoreTracks = ['INTERNAL', 'CLOSED', 'OPEN', 'PRODUCTION'] as const;
export const playStoreReleaseStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'ROLLED_OUT', 'HALTED', 'ROLLED_BACK'] as const;
export const playStoreReportTypes = ['STORE_READINESS', 'COMPLIANCE', 'RELEASE', 'LAUNCH', 'PRE_LAUNCH'] as const;

export const listPlayStoreReleasesQuerySchema = paginationSchema.extend({
  app: z.enum(playStoreApps).optional(),
  track: z.enum(playStoreTracks).optional(),
  status: z.enum(playStoreReleaseStatuses).optional(),
});

export const createPlayStoreReleaseSchema = z.object({
  app: z.enum(playStoreApps),
  versionName: z.string().regex(/^\d+\.\d+\.\d+$/),
  versionCode: z.coerce.number().int().positive(),
  track: z.enum(playStoreTracks).default('INTERNAL'),
  releaseNotes: z.string().max(5000).optional(),
  rolloutPercent: z.coerce.number().int().min(0).max(100).optional(),
});

export const playStoreWebhookSchema = z.object({
  app: z.enum(['customer', 'dsa', 'CUSTOMER', 'DSA']),
  versionName: z.string().max(32),
  versionCode: z.coerce.number().int().positive(),
  track: z.enum(['internal', 'closed', 'open', 'production', 'INTERNAL', 'CLOSED', 'OPEN', 'PRODUCTION']),
  status: z.enum(playStoreReleaseStatuses).optional(),
  aabArtifactUrl: z.string().url().optional(),
  releaseNotes: z.string().max(5000).optional(),
  commitSha: z.string().max(64).optional(),
});
