import { emiCalculatorService } from '../../../src/modules/finance-engine/services/emi-calculator.service.js';

describe('emiCalculatorService', () => {
  it('calculates EMI without amortization', () => {
    const result = emiCalculatorService.calculate({
      loanAmount: 800_000,
      interestRate: 11,
      tenureMonths: 48,
      processingFee: 2500,
      includeAmortization: false,
    });
    expect(result.emi).toBeGreaterThan(0);
    expect(result.amortizationSummary).toEqual([]);
  });

  it('includes amortization when requested', () => {
    const result = emiCalculatorService.calculate({
      loanAmount: 500_000,
      interestRate: 10,
      tenureMonths: 24,
      processingFee: 0,
      includeAmortization: true,
    });
    expect(result.amortizationSummary.length).toBeGreaterThan(0);
  });
});
