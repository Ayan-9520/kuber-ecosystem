import { PERF_THRESHOLDS } from '../thresholds.js';

export const PERF_GATE = {
  minReadinessScore: 75,
  minScalabilityScore: 70,
  minCoveragePercent: 85,
  maxP95Ms: PERF_THRESHOLDS.apiP95Ms,
  maxP99Ms: PERF_THRESHOLDS.apiP99Ms,
  maxErrorRate: PERF_THRESHOLDS.errorRateMax,
  requiredSuites: [
    'performance-testing/k6/smoke.js',
    'apps/backend/tests/performance',
    'apps/admin/tests/performance',
    'apps/mobile-customer/tests/performance',
    'apps/mobile-dsa/tests/performance',
  ],
};
