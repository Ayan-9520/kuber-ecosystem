import type { SecurityDomain, SecurityScoreCard } from '../types.js';

export interface DomainTestResult {
  domain: SecurityDomain;
  passed: number;
  total: number;
}

const DOMAIN_WEIGHTS: Record<keyof Omit<SecurityScoreCard, 'overall'>, number> = {
  authentication: 0.18,
  authorization: 0.15,
  rbac: 0.15,
  api: 0.15,
  mobile: 0.1,
  ai: 0.12,
  infrastructure: 0.15,
};

export function computeDomainScore(passed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((passed / total) * 1000) / 10;
}

export function computeOverallScore(scores: Omit<SecurityScoreCard, 'overall'>): number {
  let weighted = 0;
  for (const [key, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    weighted += scores[key as keyof typeof scores] * weight;
  }
  return Math.round(weighted * 10) / 10;
}

export function buildScoreCard(results: DomainTestResult[]): SecurityScoreCard {
  const byDomain = Object.fromEntries(
    results.map((r) => [r.domain, computeDomainScore(r.passed, r.total)]),
  ) as Omit<SecurityScoreCard, 'overall'>;

  const scores: SecurityScoreCard = {
    authentication: byDomain.authentication ?? 0,
    authorization: byDomain.authorization ?? 0,
    rbac: byDomain.rbac ?? 0,
    api: byDomain.api ?? 0,
    mobile: byDomain.mobile ?? 0,
    ai: byDomain.ai ?? 0,
    infrastructure: byDomain.infrastructure ?? 0,
    overall: 0,
  };
  scores.overall = computeOverallScore(scores);
  return scores;
}
