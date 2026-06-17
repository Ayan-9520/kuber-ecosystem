import {
  buildAmortizationSummary,
  buildEmiBreakdown,
  calculateEmi,
} from '../../../src/modules/finance-engine/utils/emi-math.utils.js';

describe('emi math utils', () => {
  it('calculates EMI for standard loan', () => {
    const emi = calculateEmi(1_000_000, 12, 60);
    expect(emi).toBeGreaterThan(20_000);
    expect(emi).toBeLessThan(25_000);
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
    const summary = buildAmortizationSummary(600_000, 9, 24);
    expect(summary).toHaveLength(2);
    expect(summary[0]!.year).toBe(1);
    expect(summary[1]!.outstandingBalance).toBe(0);
  });
});
