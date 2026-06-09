import { z } from 'zod';

import { INDIAN_PHONE_REGEX } from '../constants/sms.constants.js';

export function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

export function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  return digits;
}

export function validateIndianMobile(phone: string): boolean {
  return INDIAN_PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `******${digits.slice(-4)}`;
}

export function renderTemplateString(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

const phoneSchema = z.string().min(10).max(15);

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success && validateIndianMobile(phone);
}
