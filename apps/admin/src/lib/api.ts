import type { ApiResponse, AuthTokens } from '@kuberone/shared-types';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { tokenStorage } from '@/lib/token-storage';
import { resolveApiBaseUrl } from '@/lib/api-config';
import { mockDownload, mockGet, mockGetPaginated, mockMutate, shouldUseMock } from '@/mocks/router';

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

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<ApiResponse<AuthTokens>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const tokens = data.data;
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    tokenStorage.clearTokens();
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
    }

    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  if (shouldUseMock(url)) return mockGet<T>(url, params);
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function apiGetPaginated<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  if (shouldUseMock(url)) {
    const result = await mockGetPaginated(url, params);
    return result as { items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };
  }
  const { data } = await apiClient.get<{ success: boolean; data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
    url,
    { params },
  );
  return { items: data.data, meta: data.meta };
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  if (shouldUseMock(url)) return mockMutate<T>(url, body);
  const { data } = await apiClient.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  if (shouldUseMock(url)) return mockMutate<T>(url, body);
  const { data } = await apiClient.patch<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  if (shouldUseMock(url)) return mockMutate<T>(url, body);
  const { data } = await apiClient.put<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  if (shouldUseMock(url)) return mockMutate<T>(url);
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  return data.data;
}

export async function apiDownload(url: string, params?: Record<string, unknown>): Promise<Blob> {
  if (shouldUseMock(url)) return mockDownload(url, params);
  const { data } = await apiClient.get(url, { params, responseType: 'blob' });
  return data;
}
