import type { PerfThresholds } from './types.js';

/** KuberOne production performance SLOs */
export const PERF_THRESHOLDS: PerfThresholds = {
  apiP95Ms: 500,
  apiP99Ms: 1000,
  dashboardLoadMs: 2000,
  pageNavigationMs: 1000,
  appStartupMs: 3000,
  errorRateMax: 0.01,
};

export const K6_THRESHOLDS = {
  http_req_duration: [`p(95)<${PERF_THRESHOLDS.apiP95Ms}`, `p(99)<${PERF_THRESHOLDS.apiP99Ms}`],
  http_req_failed: [`rate<${PERF_THRESHOLDS.errorRateMax}`],
};

export const LOAD_TIERS = [100, 500, 1000, 5000, 10000] as const;

export const ENDURANCE_DURATIONS = ['4h', '8h', '12h', '24h'] as const;
