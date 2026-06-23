import { describe, expect, it } from 'vitest';

import {
  buildAmortizationSchedule,
  buildAmortizationYearSummary,
  buildEmiBreakdown,
  calculateEmi,
  tenureMonthsFromParts,
} from '../src/emi.js';

describe('emi calculator', () => {
  it('calculates standard home loan EMI (₹25L @ 9.5% for 20 years)', () => {
    expect(calculateEmi(2_500_000, 9.5, 240)).toBe(23_303);
  });

  it('calculates personal loan EMI (₹10L @ 12% for 5 years)', () => {
    const emi = calculateEmi(1_000_000, 12, 60);
    expect(emi).toBe(22_244);
  });

  it('handles zero interest', () => {
    expect(calculateEmi(120_000, 0, 12)).toBe(10_000);
  });

  it('returns zero for invalid inputs', () => {
    expect(calculateEmi(0, 9.5, 240)).toBe(0);
    expect(calculateEmi(100_000, 9.5, 0)).toBe(0);
  });

  it('builds breakdown with processing fee', () => {
    const breakdown = buildEmiBreakdown(500_000, 10.5, 36, 5_000);
    expect(breakdown.emi).toBeGreaterThan(0);
    expect(breakdown.totalCost).toBe(breakdown.totalRepayment + 5_000);
    expect(breakdown.interestPayable).toBeGreaterThan(0);
    expect(breakdown.totalRepayment).toBe(breakdown.principal + breakdown.interestPayable);
  });

  it('clears loan balance on final amortization month', () => {
    const schedule = buildAmortizationSchedule(600_000, 9, 24);
    expect(schedule).toHaveLength(24);
    expect(schedule.at(-1)?.outstandingBalance).toBe(0);
  });

  it('builds year-wise amortization summary', () => {
    const summary = buildAmortizationYearSummary(600_000, 9, 24);
    expect(summary).toHaveLength(2);
    expect(summary[0]!.year).toBe(1);
    expect(summary[1]!.outstandingBalance).toBe(0);
  });

  it('converts years and months to tenure', () => {
    expect(tenureMonthsFromParts(20, 0)).toBe(240);
    expect(tenureMonthsFromParts(5, 6)).toBe(66);
  });
});
