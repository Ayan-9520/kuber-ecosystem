import { buildAmortizationYearSummary, buildEmiBreakdown, calculateEmi } from '@kuberone/shared-utils';

describe('emi math utils', () => {
  it('calculates EMI for standard loan', () => {
    expect(calculateEmi(1_000_000, 12, 60)).toBe(22_244);
  });

  it('calculates home loan benchmark (25L @ 9.5% for 20 years)', () => {
    expect(calculateEmi(2_500_000, 9.5, 240)).toBe(23_303);
  });

  it('handles zero interest', () => {
    expect(calculateEmi(120_000, 0, 12)).toBe(10_000);
  });

  it('returns zero for invalid principal', () => {
    expect(calculateEmi(0, 12, 60)).toBe(0);
  });

  it('builds EMI breakdown with processing fee', () => {
    const breakdown = buildEmiBreakdown(500_000, 10.5, 36, 5000);
    expect(breakdown.emi).toBeGreaterThan(0);
    expect(breakdown.totalCost).toBe(breakdown.totalRepayment + 5000);
    expect(breakdown.interestPayable).toBeGreaterThan(0);
  });

  it('builds amortization summary by year', () => {
    const summary = buildAmortizationYearSummary(600_000, 9, 24);
    expect(summary).toHaveLength(2);
    expect(summary[0]!.year).toBe(1);
    expect(summary[1]!.outstandingBalance).toBe(0);
  });
});
