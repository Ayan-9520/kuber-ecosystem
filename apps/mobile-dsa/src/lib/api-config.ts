import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_SUFFIX = '/api/v1';

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

  // Hosted Partner web (Vercel): prefer explicit API URL (Cloudflare tunnel / real API).
  // Same-origin /api rewrite often 502s against trycloudflare quick tunnels from Vercel edge.
  if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
    const win = globalThis as typeof globalThis & { location?: { hostname?: string } };
    const host = win.location?.hostname;
    if (host && isHostedPartnerWebHostname(host)) {
      if (configured) return normalizeApiBaseUrl(configured);
      return API_SUFFIX;
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
