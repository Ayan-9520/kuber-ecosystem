import type { BranchAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { resolveDateRange } from '../../analytics/utils/analytics-date.utils.js';
import type { BranchPeriodType, ResolvedBranchPeriod } from '../types/branch-analytics.types.js';

function mapPresetToPeriod(preset: string | undefined): BranchPeriodType {
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
    default:
      return 'MONTHLY';
  }
}

export function resolveBranchPeriod(query: BranchAnalyticsBaseQuery): ResolvedBranchPeriod {
  const range = resolveDateRange({
    timePreset: query.timePreset,
    fromDate: query.fromDate,
    toDate: query.toDate,
  });
  return {
    ...query,
    fromDate: range.fromDate,
    toDate: range.toDate,
    periodType: query.periodType ?? mapPresetToPeriod(query.timePreset),
  };
}

export function scopedBranchQuery(query: BranchAnalyticsBaseQuery): ResolvedBranchPeriod {
  return resolveBranchPeriod(query);
}
