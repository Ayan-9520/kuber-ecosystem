import { PERF_API_PATHS, PERF_THRESHOLDS } from '@kuberone/performance-testing';
import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('Performance — API Latency', () => {
  const app = createApp();

  async function measureGet(path: string, samples = 5): Promise<number[]> {
    const times: number[] = [];
    for (let i = 0; i < samples; i++) {
      const start = performance.now();
      await request(app).get(path);
      times.push(performance.now() - start);
    }
    return times;
  }

  function percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)]!;
  }

  it('health endpoint P95 under SLO (local)', async () => {
    const times = await measureGet('/health', 10);
    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(PERF_THRESHOLDS.apiP95Ms);
  });

  it('auth gateway responds within P99 budget', async () => {
    const times = await measureGet('/api/v1/auth/me', 8);
    const p99 = percentile(times, 99);
    expect(p99).toBeLessThan(PERF_THRESHOLDS.apiP99Ms);
  });

  it.each(PERF_API_PATHS.slice(0, 6))('catalog path %s responds without 5xx', async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBeLessThan(500);
  });

  it('parallel batch of read endpoints completes under dashboard SLO', async () => {
    const paths = ['/health', '/api/v1/leads', '/api/v1/customers', '/api/v1/applications'];
    const start = performance.now();
    await Promise.all(paths.map((p) => request(app).get(p)));
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(PERF_THRESHOLDS.dashboardLoadMs);
  });
});
