import { env } from '../../../config/env.js';

export const BRANCH_CACHE_TTL_MS = env.ANALYTICS_CACHE_TTL_MS;

export const REGIONAL_ROLES = ['REGIONAL_MANAGER', 'MANAGEMENT', 'ADMIN', 'SUPER_ADMIN'] as const;
export const BRANCH_MANAGER_ROLES = ['BRANCH_MANAGER'] as const;
export const MANAGEMENT_ROLES = ['MANAGEMENT', 'ADMIN', 'SUPER_ADMIN'] as const;
