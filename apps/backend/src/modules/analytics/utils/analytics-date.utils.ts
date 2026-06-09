import type { AnalyticsBaseQuery } from '@kuberone/shared-validation';

import type { ResolvedDateRange } from '../types/analytics.types.js';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function resolveDateRange(query: AnalyticsBaseQuery): ResolvedDateRange {
  const now = new Date();
  const preset = query.timePreset ?? (query.fromDate || query.toDate ? 'CUSTOM' : 'THIS_MONTH');

  switch (preset) {
    case 'TODAY':
      return { fromDate: startOfDay(now), toDate: endOfDay(now), timePreset: preset };
    case 'YESTERDAY': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { fromDate: startOfDay(y), toDate: endOfDay(y), timePreset: preset };
    }
    case 'THIS_WEEK':
      return { fromDate: startOfWeek(now), toDate: endOfDay(now), timePreset: preset };
    case 'THIS_MONTH':
      return { fromDate: startOfMonth(now), toDate: endOfDay(now), timePreset: preset };
    case 'THIS_QUARTER':
      return { fromDate: startOfQuarter(now), toDate: endOfDay(now), timePreset: preset };
    case 'THIS_YEAR':
      return { fromDate: startOfYear(now), toDate: endOfDay(now), timePreset: preset };
    case 'CUSTOM':
    default:
      return {
        fromDate: query.fromDate ? startOfDay(query.fromDate) : startOfMonth(now),
        toDate: query.toDate ? endOfDay(query.toDate) : endOfDay(now),
        timePreset: 'CUSTOM',
      };
  }
}

export function scopedQuery(query: AnalyticsBaseQuery): AnalyticsBaseQuery & { fromDate: Date; toDate: Date } {
  const range = resolveDateRange(query);
  return { ...query, fromDate: range.fromDate, toDate: range.toDate };
}
