/** Mobile performance budgets aligned with KuberOne SLOs */
export const MOBILE_PERF_BUDGETS = {
  appStartupMs: 3000,
  screenLoadMs: 1000,
  navigationMs: 1000,
  apiLatencyMs: 500,
  memoryMbMax: 256,
} as const;

export const CRM_PERF_BUDGETS = {
  dashboardLoadMs: 2000,
  listRenderMs: 1500,
  chartRenderMs: 1200,
  searchDebounceMs: 300,
  exportMaxMs: 10000,
} as const;
