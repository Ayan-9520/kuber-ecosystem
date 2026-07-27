const API_SUFFIX = '/api/v1';

/**
 * Ensure API base URL always ends with /api/v1.
 * Vercel env often omits the suffix (e.g. tunnel root only) which causes 404 on /auth/login.
 */
export function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return API_SUFFIX;
  if (trimmed.endsWith(API_SUFFIX)) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  if (trimmed.startsWith('/') && !trimmed.includes('/api')) {
    return `${trimmed}${API_SUFFIX}`;
  }
  if (!trimmed.includes('/api/') && !trimmed.endsWith('/api')) {
    return `${trimmed}${API_SUFFIX}`;
  }
  return trimmed;
}

function isHostedAdminHostname(hostname: string): boolean {
  return (
    hostname === 'kuberone.online' ||
    hostname === 'www.kuberone.online' ||
    hostname.endsWith('.vercel.app')
  );
}

/**
 * Hosted Admin (Vercel / kuberone.online) always uses same-origin `/api/v1`.
 * Vercel rewrites proxy `/api/*` to the Cloudflare tunnel → local Docker backend.
 * This avoids dead trycloudflare URLs baked into old Vercel env builds.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined' && isHostedAdminHostname(window.location.hostname)) {
    return API_SUFFIX;
  }
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured?.trim()) return normalizeApiBaseUrl(configured);
  return API_SUFFIX;
}
