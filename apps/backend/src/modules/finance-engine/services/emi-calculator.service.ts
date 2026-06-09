import type { CalculateEmiInput } from '@kuberone/shared-validation';

import type { EmiCalculationResult } from '../types/finance-engine.types.js';
import { buildAmortizationSummary, buildEmiBreakdown } from '../utils/emi-math.utils.js';

export const emiCalculatorService = {
  calculate(input: CalculateEmiInput): EmiCalculationResult {
    const breakdown = buildEmiBreakdown(
      input.loanAmount,
      input.interestRate,
      input.tenureMonths,
      input.processingFee,
    );

    return {
      ...breakdown,
      loanAmount: input.loanAmount,
      interestRate: input.interestRate,
      tenureMonths: input.tenureMonths,
      amortizationSummary: input.includeAmortization
        ? buildAmortizationSummary(input.loanAmount, input.interestRate, input.tenureMonths)
        : [],
    };
  },
};
