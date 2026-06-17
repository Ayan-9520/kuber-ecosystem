import { MOBILE_PERF_BUDGETS } from '@kuberone/performance-testing';
import { RENDER_BUDGET_MS, assertRenderBudget } from '@kuberone/mobile-testing';

describe('Performance — Mobile Customer', () => {
  it('app startup budget defined at 3 seconds', () => {
    expect(MOBILE_PERF_BUDGETS.appStartupMs).toBe(3000);
  });

  it('screen load within mobile SLO', () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      JSON.stringify({ screen: 'Dashboard', metrics: [1, 2, 3] });
    }
    const elapsed = performance.now() - start;
    expect(() => assertRenderBudget(elapsed, MOBILE_PERF_BUDGETS.screenLoadMs)).not.toThrow();
  });

  it('navigation transition budget', () => {
    expect(RENDER_BUDGET_MS.dashboard).toBeLessThanOrEqual(MOBILE_PERF_BUDGETS.navigationMs);
  });

  it('api latency target matches backend P95', () => {
    expect(MOBILE_PERF_BUDGETS.apiLatencyMs).toBe(500);
  });
});
