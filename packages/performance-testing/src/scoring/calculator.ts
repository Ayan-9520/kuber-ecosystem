import type { PerfMetrics } from '../types.js';
import { PERF_THRESHOLDS } from '../thresholds.js';

export function scoreFromP95(p95Ms: number): number {
  if (p95Ms <= PERF_THRESHOLDS.apiP95Ms * 0.5) return 100;
  if (p95Ms <= PERF_THRESHOLDS.apiP95Ms) return 90;
  if (p95Ms <= PERF_THRESHOLDS.apiP99Ms) return 75;
  if (p95Ms <= PERF_THRESHOLDS.apiP99Ms * 1.5) return 60;
  return 40;
}

export function computeScalabilityScore(maxUsers: number, errorRate: number): number {
  let score = 50;
  if (maxUsers >= 10000) score = 95;
  else if (maxUsers >= 5000) score = 88;
  else if (maxUsers >= 1000) score = 80;
  else if (maxUsers >= 500) score = 72;
  else if (maxUsers >= 100) score = 65;
  if (errorRate > PERF_THRESHOLDS.errorRateMax) score -= 20;
  return Math.max(0, Math.min(100, score));
}

export function computeReadinessScore(
  metrics: PerfMetrics,
  domainScores: Record<string, number>,
): number {
  const apiScore = scoreFromP95(metrics.p95ResponseMs);
  const domainAvg =
    Object.values(domainScores).reduce((a, b) => a + b, 0) / Math.max(Object.keys(domainScores).length, 1);
  const scalability = computeScalabilityScore(metrics.maxConcurrentUsers, metrics.errorRate);
  return Math.round((apiScore * 0.35 + domainAvg * 0.35 + scalability * 0.3) * 10) / 10;
}
