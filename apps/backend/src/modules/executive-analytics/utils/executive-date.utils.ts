import type { ExecutiveAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { resolveDateRange } from '../../analytics/utils/analytics-date.utils.js';
import type { ExecutivePeriodType, ResolvedExecutivePeriod } from '../types/executive-analytics.types.js';

function mapPresetToPeriod(preset: string | undefined): ExecutivePeriodType {
  switch (preset) {
    case 'TODAY':
    case 'YESTERDAY':
      return 'DAILY';
    case 'THIS_WEEK':
      return 'WEEKLY';
    case 'THIS_QUARTER':
      return 'QUARTERLY';
    case 'THIS_YEAR':
      return 'YEARLY';
    case 'THIS_MONTH':
    case 'CUSTOM':
    default:
      return 'MONTHLY';
  }
}

export function resolveExecutivePeriod(query: ExecutiveAnalyticsBaseQuery): ResolvedExecutivePeriod {
  const range = resolveDateRange({
    timePreset: query.timePreset,
    fromDate: query.fromDate,
    toDate: query.toDate,
  });
  const periodType = query.periodType ?? mapPresetToPeriod(query.timePreset);
  return {
    ...query,
    fromDate: range.fromDate,
    toDate: range.toDate,
    periodType,
  };
}

export function scopedExecutiveQuery(query: ExecutiveAnalyticsBaseQuery): ResolvedExecutivePeriod {
  return resolveExecutivePeriod(query);
}
