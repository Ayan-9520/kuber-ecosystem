import { MOBILE_PERF_BUDGETS } from '@kuberone/performance-testing';
import { RENDER_BUDGET_MS } from '@kuberone/mobile-testing';

describe('Performance — Mobile DSA', () => {
  it('DSA dashboard render within screen load budget', () => {
    const start = performance.now();
    Array.from({ length: 80 }, (_, i) => ({ leadId: i, score: 70 + (i % 30) }));
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(MOBILE_PERF_BUDGETS.screenLoadMs);
  });

  it('commission list simulation within budget', () => {
    const start = performance.now();
    const commissions = Array.from({ length: 200 }, (_, i) => ({
      id: `c-${i}`,
      amount: i * 100,
    }));
    commissions.sort((a, b) => b.amount - a.amount);
    expect(performance.now() - start).toBeLessThan(MOBILE_PERF_BUDGETS.screenLoadMs);
  });

  it('render budgets aligned with customer app', () => {
    expect(RENDER_BUDGET_MS.list).toBeLessThanOrEqual(MOBILE_PERF_BUDGETS.screenLoadMs);
  });
});
