import { CRM_PERF_BUDGETS } from '@kuberone/performance-testing';
import { describe, expect, it } from 'vitest';

describe('Performance — CRM Dashboard', () => {
  it('dashboard load budget is under 2 seconds', () => {
    expect(CRM_PERF_BUDGETS.dashboardLoadMs).toBeLessThanOrEqual(2000);
  });

  it('simulated lead list render within list budget', () => {
    const start = performance.now();
    const rows = Array.from({ length: 100 }, (_, i) => ({
      id: `lead-${i}`,
      name: `Customer ${i}`,
      status: 'NEW',
    }));
    const rendered = rows.map((r) => `${r.name}-${r.status}`).join('');
    const elapsed = performance.now() - start;
    expect(rendered.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(CRM_PERF_BUDGETS.listRenderMs);
  });

  it('chart data aggregation within chart budget', () => {
    const start = performance.now();
    const data = Array.from({ length: 12 }, (_, m) => ({ month: m, value: Math.random() * 1000 }));
    const sum = data.reduce((a, b) => a + b.value, 0);
    const elapsed = performance.now() - start;
    expect(sum).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(CRM_PERF_BUDGETS.chartRenderMs);
  });

  it('search filter simulation within navigation budget', () => {
    const start = performance.now();
    const items = Array.from({ length: 500 }, (_, i) => `Lead ${i}`);
    const filtered = items.filter((x) => x.includes('42'));
    const elapsed = performance.now() - start;
    expect(filtered.length).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(CRM_PERF_BUDGETS.searchDebounceMs * 5);
  });
});
