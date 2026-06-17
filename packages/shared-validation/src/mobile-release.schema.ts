import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const mobileAppTypes = ['CUSTOMER', 'DSA'] as const;
export const mobileBuildFormats = ['APK', 'AAB'] as const;
export const mobileBuildStatuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'] as const;
export const mobileAppEnvironments = ['DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION'] as const;
export const mobileReleaseStatuses = ['PLANNED', 'IN_PROGRESS', 'RELEASED', 'FAILED', 'ROLLED_BACK'] as const;

export const listMobileBuildsQuerySchema = paginationSchema.extend({
  app: z.enum(mobileAppTypes).optional(),
  environment: z.enum(mobileAppEnvironments).optional(),
  buildFormat: z.enum(mobileBuildFormats).optional(),
  status: z.enum(mobileBuildStatuses).optional(),
  versionName: z.string().max(32).optional(),
});

export const listMobileReleasesQuerySchema = paginationSchema.extend({
  app: z.enum(mobileAppTypes).optional(),
  status: z.enum(mobileReleaseStatuses).optional(),
  versionName: z.string().max(32).optional(),
});

export const createMobileReleaseSchema = z.object({
  app: z.enum(mobileAppTypes),
  versionName: z.string().regex(/^\d+\.\d+\.\d+$/),
  versionCode: z.coerce.number().int().positive(),
  track: z.enum(['internal', 'alpha', 'beta', 'production']).default('internal'),
  releaseNotes: z.string().max(5000).optional(),
});

export const mobileBuildWebhookSchema = z.object({
  app: z.enum(['customer', 'dsa', 'CUSTOMER', 'DSA']),
  buildType: z.enum(['apk', 'aab', 'APK', 'AAB']),
  environment: z.enum(['development', 'qa', 'staging', 'production', 'DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION']),
  versionName: z.string().max(32),
  versionCode: z.coerce.number().int().positive(),
  status: z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED']).default('SUCCESS'),
  artifactUrl: z.string().url().optional(),
  commitSha: z.string().max(64).optional(),
  branch: z.string().max(128).optional(),
  packageId: z.string().max(128).optional(),
  signed: z.boolean().optional(),
  report: z.record(z.unknown()).optional(),
});
