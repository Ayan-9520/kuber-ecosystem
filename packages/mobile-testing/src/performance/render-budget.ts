/** Screen render time budgets (ms) for performance tests. */
export const RENDER_BUDGET_MS = {
  splash: 50,
  login: 120,
  dashboard: 200,
  list: 250,
  detail: 200,
  aiChat: 300,
} as const;

export function assertRenderBudget(elapsedMs: number, budgetMs: number): void {
  if (elapsedMs > budgetMs) {
    throw new Error(`Render budget exceeded: ${elapsedMs}ms > ${budgetMs}ms`);
  }
}
