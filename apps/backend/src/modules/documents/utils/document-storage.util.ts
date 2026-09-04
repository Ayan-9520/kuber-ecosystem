import { env } from '../../../config/env.js';

/**
 * Prefer S3 when credentials exist. Otherwise use local disk
 * (dev/test and staged VPS with DOCUMENT_STORAGE_PATH volume).
 */
export function shouldUseLocalDocumentStorage(): boolean {
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return false;
  }
  return true;
}

export function buildLocalDownloadUrl(storageKey: string): string {
  const base = env.API_BASE_URL.replace(/\/$/, '');
  return `${base}/api/${env.API_VERSION}/documents/local-download?key=${encodeURIComponent(storageKey)}`;
}
