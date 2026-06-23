import { AxiosError } from 'axios';

export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value?: number | null, decimals = 0): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.error?.message;
    if (typeof msg === 'string') return msg;
    if (error.response?.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.code === 'ERR_NETWORK') return 'Cannot reach server. Check your connection.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export function str(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function maskPhone(phone: string): string {
  const d = normalizePhone(phone);
  if (d.length < 10) return phone;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}
