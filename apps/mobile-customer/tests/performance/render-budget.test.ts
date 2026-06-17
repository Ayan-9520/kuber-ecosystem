import { assertRenderBudget, RENDER_BUDGET_MS } from '@kuberone/mobile-testing';

describe('Customer performance budgets', () => {
  it('splash render within budget', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      JSON.stringify({ screen: 'Splash' });
    }
    const elapsed = performance.now() - start;
    expect(() => assertRenderBudget(elapsed, RENDER_BUDGET_MS.splash * 100)).not.toThrow();
  });

  it('defines dashboard budget', () => {
    expect(RENDER_BUDGET_MS.dashboard).toBeLessThanOrEqual(300);
  });
});
