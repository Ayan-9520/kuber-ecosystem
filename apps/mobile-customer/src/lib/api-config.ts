import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_SUFFIX = '/api/v1';

/**
 * Permanent production API (VPS / Cloudflare tunnel named host).
 * Keep in sync with apps/mobile-customer/vercel.json destinations.
 */
const HOSTED_CUSTOMER_API_FALLBACK = 'https://falling-smoking-wondering-trackbacks.trycloudflare.com';

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

function isHostedCustomerWebHostname(hostname: string): boolean {
  return (
    hostname === 'customer.kuberone.online' ||
    hostname === 'app.kuberone.online' ||
    hostname === 'my.kuberone.online' ||
    hostname.endsWith('.vercel.app')
  );
}

/**
 * Resolve API base URL from env or Expo extra.
 * Hosted web always prefers absolute https API (never same-origin /api alone).
 */
export function resolveApiBaseUrl(): string {
  const configured = readConfiguredUrl();

  if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
    const win = globalThis as typeof globalThis & { location?: { hostname?: string } };
    const host = win.location?.hostname;
    if (host && isHostedCustomerWebHostname(host)) {
      const absoluteConfigured =
        configured &&
        /^https?:\/\//i.test(configured) &&
        !/localhost|127\.0\.0\.1/i.test(configured)
          ? configured
          : undefined;
      return normalizeApiBaseUrl(absoluteConfigured || HOSTED_CUSTOMER_API_FALLBACK);
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

  return normalizeApiBaseUrl(HOSTED_CUSTOMER_API_FALLBACK);
}
