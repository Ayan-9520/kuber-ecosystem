import type { CalculateSavingsInput } from '@kuberone/shared-validation';

import type { SavingsCalculationResult } from '../types/finance-engine.types.js';
import { calculateEmi } from '../utils/emi-math.utils.js';
import { roundCurrency } from '../utils/finance-engine.utils.js';

export const savingsCalculatorService = {
  calculate(input: CalculateSavingsInput): SavingsCalculationResult {
    const currentEmi = calculateEmi(
      input.outstandingPrincipal,
      input.currentInterestRate,
      input.remainingTenureMonths,
    );

    const newLoanAmount = roundCurrency(input.outstandingPrincipal + input.topUpAmount);
    const newEmi = calculateEmi(newLoanAmount, input.newInterestRate, input.newTenureMonths);

    const monthlySavings = roundCurrency(currentEmi - newEmi);
    const annualSavings = roundCurrency(monthlySavings * 12);

    const currentLifetimeCost = roundCurrency(currentEmi * input.remainingTenureMonths);
    const newLifetimeCost = roundCurrency(newEmi * input.newTenureMonths);
    const totalSwitchCost = roundCurrency(input.processingFee + input.foreclosureCharges);
    const lifetimeSavings = roundCurrency(currentLifetimeCost - newLifetimeCost - totalSwitchCost);

    let breakEvenMonths: number | null = null;
    if (monthlySavings > 0 && totalSwitchCost > 0) {
      breakEvenMonths = Math.ceil(totalSwitchCost / monthlySavings);
    }

    return {
      currentEmi,
      newEmi,
      monthlySavings,
      annualSavings,
      lifetimeSavings,
      breakEvenMonths,
      newLoanAmount,
      totalSwitchCost,
    };
  },
};
