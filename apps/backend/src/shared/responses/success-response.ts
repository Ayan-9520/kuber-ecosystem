import type { ApiResponse, PaginatedMeta } from '@kuberone/shared-types';

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginatedMeta,
  message?: string,
): { success: true; data: T[]; meta: PaginatedMeta; message?: string } {
  return {
    success: true,
    data,
    meta,
    ...(message ? { message } : {}),
  };
}
