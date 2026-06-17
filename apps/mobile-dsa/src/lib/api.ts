import type { ApiResponse, AuthTokens } from '@kuberone/shared-types';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './storage';
import { getWebHostname } from './webStorage';

function resolveDevMachineHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

  if (getWebHostname() === 'localhost') {
    return 'http://localhost:4000/api/v1';
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:4000/api/v1';
  }

  const devHost = resolveDevMachineHost();
  if (devHost) {
    return `http://${devHost}:4000/api/v1`;
  }

  return configured;
}

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
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
    await setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
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
