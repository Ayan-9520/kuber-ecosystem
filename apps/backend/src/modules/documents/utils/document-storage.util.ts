import { env } from '../../../config/env.js';

export function shouldUseLocalDocumentStorage(): boolean {
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return false;
  }
  return env.APP_ENV === 'development' || env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
}

export function buildLocalDownloadUrl(storageKey: string): string {
  const base = env.API_BASE_URL.replace(/\/$/, '');
  return `${base}/api/${env.API_VERSION}/documents/local-download?key=${encodeURIComponent(storageKey)}`;
}
