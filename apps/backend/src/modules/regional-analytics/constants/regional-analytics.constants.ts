import { env } from '../../../config/env.js';

export const REGIONAL_CACHE_TTL_MS = env.ANALYTICS_CACHE_TTL_MS;

export const MANAGEMENT_ROLES = ['MANAGEMENT', 'ADMIN', 'SUPER_ADMIN'] as const;
export const REGIONAL_MANAGER_ROLES = ['REGIONAL_MANAGER'] as const;
