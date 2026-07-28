import type { ApiResponse, AuthTokens } from '@kuberone/shared-types';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { resolveApiBaseUrl } from './api-config';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './storage';

const API_BASE_URL = resolveApiBaseUrl();

export { API_BASE_URL };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

/** In-memory token so /auth/me right after login never races storage. */
let memoryAccessToken: string | null = null;

export function setMemoryAccessToken(token: string | null): void {
  memoryAccessToken = token;
}

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGatewayError(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === 502 || status === 503 || status === 504) return true;
  if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
    return true;
  }
  return false;
}

apiClient.interceptors.request.use(async (config) => {
  const token = memoryAccessToken ?? (await getAccessToken());
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    memoryAccessToken = null;
    await clearTokens();
    return null;
  }

  try {
    const { data } = await axios.post<ApiResponse<AuthTokens>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const tokens = data.data;
    memoryAccessToken = tokens.accessToken;
    await setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    memoryAccessToken = null;
    await clearTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _gatewayRetry?: number;
    };

    if (!original) {
      return Promise.reject(error);
    }

    // Cloudflare / Vercel tunnel can 502 on the first cold hop — retry a couple times.
    const gatewayAttempt = original._gatewayRetry ?? 0;
    if (isRetryableGatewayError(error) && gatewayAttempt < 2) {
      original._gatewayRetry = gatewayAttempt + 1;
      await sleep(400 * (gatewayAttempt + 1));
      return apiClient(original);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }

      onSessionExpired?.();
      memoryAccessToken = null;
      await clearTokens();
    }

    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function apiGetPaginated<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>(url, { params });
  return { items: data.data, meta: data.meta };
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.patch<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  return data.data;
}
