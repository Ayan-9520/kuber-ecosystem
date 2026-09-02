import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_SUFFIX = '/api/v1';

/**
 * Fallback when Vercel build env is missing / stale.
 * Keep in sync with apps/mobile-dsa/vercel.json EXPO_PUBLIC_API_BASE_URL.
 * Never use same-origin /api on partner.kuberone.online — Vercel→trycloudflare rewrites 502.
 */
const HOSTED_PARTNER_API_FALLBACK = 'https://tutorials-reprints-pushed-developmental.trycloudflare.com';

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.endsWith(API_SUFFIX)) return trimmed;
  return `${trimmed}${API_SUFFIX}`;
}

function readConfiguredUrl(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  const fromVite = process.env.VITE_API_BASE_URL?.trim();
  if (fromVite) return fromVite;
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  if (fromExtra?.trim()) return fromExtra.trim();
  return undefined;
}

function isLocalDevHost(): boolean {
  if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
    const win = globalThis as typeof globalThis & { location?: { hostname?: string } };
    const host = win.location?.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') return false;
  }
  return true;
}

function isHostedPartnerWebHostname(hostname: string): boolean {
  return (
    hostname === 'partner.kuberone.online' ||
    hostname === 'dsa.kuberone.online' ||
    hostname.endsWith('.vercel.app')
  );
}

/** @see apps/mobile-customer/src/lib/api-config.ts */
export function resolveApiBaseUrl(): string {
  const configured = readConfiguredUrl();

  // Hosted Partner web: always hit Cloudflare tunnel / public API directly.
  if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
    const win = globalThis as typeof globalThis & { location?: { hostname?: string } };
    const host = win.location?.hostname;
    if (host && isHostedPartnerWebHostname(host)) {
      const absoluteConfigured =
        configured && /^https?:\/\//i.test(configured) ? configured : undefined;
      return normalizeApiBaseUrl(absoluteConfigured || HOSTED_PARTNER_API_FALLBACK);
    }
  }

  if (configured) {
    return normalizeApiBaseUrl(configured);
  }

  if (__DEV__ && isLocalDevHost()) {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      return `http://10.0.2.2:4000${API_SUFFIX}`;
    }
    return `http://localhost:4000${API_SUFFIX}`;
  }

  return normalizeApiBaseUrl('https://api.kuberone.com');
}
