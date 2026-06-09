import type { PaginatedMeta } from '@kuberone/shared-types';

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount?: number | string | null): string {
  if (amount === null || amount === undefined) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPercent(value?: number | null, decimals = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function paginationRange(meta: PaginatedMeta): string {
  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);
  return `${start}–${end} of ${meta.total}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getDeviceId(): string {
  const key = 'kuberone_device_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function fieldStr(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

export function fieldNum(row: Record<string, unknown>, key: string): number | null {
  const v = row[key];
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = (error as {
      response?: {
        status?: number;
        data?: { error?: { message?: string; details?: Record<string, string[]> } };
      };
    }).response;
    if (resp?.data?.error?.message) return resp.data.error.message;
    if (resp?.status === 500) {
      return 'Backend error. Ensure API is running: pnpm dev:backend';
    }
    if (resp?.status === 401) return 'Invalid email or password';
    if (resp?.status === 422) return 'Please check your input and try again';
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED') {
      return 'Cannot reach API server. Start backend: pnpm dev:backend';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
