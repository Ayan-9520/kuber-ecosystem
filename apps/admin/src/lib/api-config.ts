const API_SUFFIX = '/api/v1';

/** Keep in sync with apps/admin/vercel.json tunnel destination. */
const HOSTED_ADMIN_API_FALLBACK = 'https://shows-like-gibson-shaw.trycloudflare.com';

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
 * Hosted Admin: hit Cloudflare tunnel / public API directly.
 * Same-origin /api rewrites to trycloudflare often 502 (DNS_HOSTNAME_NOT_FOUND) from Vercel edge.
 */
export function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (typeof window !== 'undefined' && isHostedAdminHostname(window.location.hostname)) {
    const absoluteConfigured =
      configured && /^https?:\/\//i.test(configured) ? configured : undefined;
    return normalizeApiBaseUrl(absoluteConfigured || HOSTED_ADMIN_API_FALLBACK);
  }
  if (configured) return normalizeApiBaseUrl(configured);
  return API_SUFFIX;
}
