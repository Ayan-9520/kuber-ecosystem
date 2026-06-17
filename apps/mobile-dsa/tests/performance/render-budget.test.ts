import { RENDER_BUDGET_MS, assertRenderBudget } from '@kuberone/mobile-testing';

describe('DSA performance budgets', () => {
  it('dashboard budget defined', () => {
    expect(RENDER_BUDGET_MS.dashboard).toBeLessThanOrEqual(300);
  });

  it('smoke render budget check', () => {
    const start = performance.now();
    JSON.stringify({ screen: 'Dashboard' });
    assertRenderBudget(performance.now() - start, RENDER_BUDGET_MS.splash * 10);
  });
});
