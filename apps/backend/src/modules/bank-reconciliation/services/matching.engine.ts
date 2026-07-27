import type { LoanCase } from '../../loan-fulfillment/types/loan-fulfillment.types.js';
import {
  AMOUNT_TOLERANCE_ABS,
  AMOUNT_TOLERANCE_RATIO,
  MATCH_SCORE_THRESHOLD,
} from '../constants/bank-reconciliation.constants.js';
import type {
  MatchType,
  StatementLineItem,
  VarianceType,
} from '../types/bank-reconciliation.types.js';

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeRef(s: string): string {
  return s.trim().toUpperCase().replace(/[\s-]/g, '');
}

function amountsClose(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) {
    return Math.abs(a - b) <= AMOUNT_TOLERANCE_ABS;
  }
  const ratio = Math.abs(a - b) / Math.max(b, 1);
  return ratio <= AMOUNT_TOLERANCE_RATIO || Math.abs(a - b) <= AMOUNT_TOLERANCE_ABS;
}

/** Simple token / substring similarity 0–1 for fuzzy customer names. */
function nameSimilarity(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const ta = new Set(na.split(' ').filter(Boolean));
  const tb = new Set(nb.split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let overlap = 0;
  for (const t of Array.from(ta)) {
    if (tb.has(t)) overlap += 1;
    else {
      for (const u of Array.from(tb)) {
        if (t.length > 3 && u.length > 3 && (t.startsWith(u.slice(0, 4)) || u.startsWith(t.slice(0, 4)))) {
          overlap += 0.6;
          break;
        }
      }
    }
  }
  return overlap / Math.max(ta.size, tb.size);
}

export function classifyVariance(received: number, expected: number): VarianceType {
  const variance = roundMoney(received - expected);
  if (expected <= 0 && received <= 0) return 'MISSING';
  if (Math.abs(variance) < 0.005) return 'MATCHED';
  if (variance < 0) return 'SHORT_PAYMENT';
  return 'EXCESS';
}

export interface MatchCandidate {
  caseId: string;
  caseNumber: string;
  matchType: MatchType;
  matchScore: number;
  expectedCommission: number;
}

/**
 * Match precedence: loanAccountNumber exact → applicationNumber exact →
 * PAN + amount tolerance → fuzzy customerName + disbursedAmount tolerance.
 */
export function matchStatementLine(
  line: Pick<
    StatementLineItem,
    | 'loanAccountNumber'
    | 'applicationNumber'
    | 'pan'
    | 'customerName'
    | 'disbursedAmount'
    | 'commissionAmount'
  >,
  cases: LoanCase[],
): MatchCandidate | null {
  const lan = line.loanAccountNumber ? normalizeRef(line.loanAccountNumber) : '';
  if (lan) {
    const hit = cases.find(
      (c) => c.loanAccountNumber && normalizeRef(c.loanAccountNumber) === lan,
    );
    if (hit) {
      return {
        caseId: hit.id,
        caseNumber: hit.caseNumber,
        matchType: 'EXACT',
        matchScore: 100,
        expectedCommission: roundMoney(hit.expectedCommission ?? hit.expectedRevenue ?? 0),
      };
    }
  }

  const appNo = line.applicationNumber ? normalizeRef(line.applicationNumber) : '';
  if (appNo) {
    const hit = cases.find(
      (c) =>
        (c.bankApplicationNumber && normalizeRef(c.bankApplicationNumber) === appNo) ||
        normalizeRef(c.caseNumber) === appNo,
    );
    if (hit) {
      return {
        caseId: hit.id,
        caseNumber: hit.caseNumber,
        matchType: 'EXACT',
        matchScore: 95,
        expectedCommission: roundMoney(hit.expectedCommission ?? hit.expectedRevenue ?? 0),
      };
    }
  }

  const pan = line.pan ? normalizeRef(line.pan) : '';
  if (pan) {
    let best: MatchCandidate | null = null;
    for (const c of cases) {
      if (!c.pan || normalizeRef(c.pan) !== pan) continue;
      const caseAmt = c.disbursementAmount ?? c.loanAmount;
      const amountOk = amountsClose(line.disbursedAmount, caseAmt);
      const score = amountOk ? 80 : 55;
      if (!best || score > best.matchScore) {
        best = {
          caseId: c.id,
          caseNumber: c.caseNumber,
          matchType: score >= MATCH_SCORE_THRESHOLD ? 'PROBABLE' : 'UNMATCHED',
          matchScore: score,
          expectedCommission: roundMoney(c.expectedCommission ?? c.expectedRevenue ?? 0),
        };
      }
    }
    if (best && best.matchScore >= MATCH_SCORE_THRESHOLD) return best;
  }

  let fuzzyBest: MatchCandidate | null = null;
  for (const c of cases) {
    const sim = nameSimilarity(line.customerName, c.customerName);
    if (sim < 0.55) continue;
    const caseAmt = c.disbursementAmount ?? c.loanAmount;
    const amountOk = amountsClose(line.disbursedAmount, caseAmt);
    const score = Math.round(sim * 50 + (amountOk ? 30 : 0));
    if (!fuzzyBest || score > fuzzyBest.matchScore) {
      fuzzyBest = {
        caseId: c.id,
        caseNumber: c.caseNumber,
        matchType: score >= MATCH_SCORE_THRESHOLD ? 'PROBABLE' : 'UNMATCHED',
        matchScore: Math.min(score, 89),
        expectedCommission: roundMoney(c.expectedCommission ?? c.expectedRevenue ?? 0),
      };
    }
  }

  if (fuzzyBest && fuzzyBest.matchScore >= MATCH_SCORE_THRESHOLD) return fuzzyBest;
  if (fuzzyBest) {
    return { ...fuzzyBest, matchType: 'UNMATCHED' };
  }
  return null;
}
