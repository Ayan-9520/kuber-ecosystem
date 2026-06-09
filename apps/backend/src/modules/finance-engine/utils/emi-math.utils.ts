import type { AmortizationYearSummary, EmiBreakdown } from '../types/finance-engine.types.js';

import { roundCurrency } from './finance-engine.utils.js';

export function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct === 0) return roundCurrency(principal / tenureMonths);

  const monthlyRate = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return roundCurrency((principal * monthlyRate * factor) / (factor - 1));
}

export function buildEmiBreakdown(
  loanAmount: number,
  interestRate: number,
  tenureMonths: number,
  processingFee: number,
): EmiBreakdown {
  const emi = calculateEmi(loanAmount, interestRate, tenureMonths);
  const totalRepayment = roundCurrency(emi * tenureMonths);
  const interestPayable = roundCurrency(totalRepayment - loanAmount);

  return {
    emi,
    principal: loanAmount,
    interestPayable,
    totalRepayment,
    processingFee,
    totalCost: roundCurrency(totalRepayment + processingFee),
  };
}

export function buildAmortizationSummary(
  loanAmount: number,
  interestRate: number,
  tenureMonths: number,
): AmortizationYearSummary[] {
  const emi = calculateEmi(loanAmount, interestRate, tenureMonths);
  const monthlyRate = interestRate / 12 / 100;
  let balance = loanAmount;
  const monthly: Array<{ principalPaid: number; interestPaid: number }> = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestComponent = interestRate === 0 ? 0 : roundCurrency(balance * monthlyRate);
    const principalComponent = roundCurrency(Math.min(emi - interestComponent, balance));
    balance = roundCurrency(Math.max(balance - principalComponent, 0));
    monthly.push({ principalPaid: principalComponent, interestPaid: interestComponent });
  }

  const years = Math.ceil(tenureMonths / 12);
  const summary: AmortizationYearSummary[] = [];

  for (let year = 1; year <= years; year++) {
    const startMonth = (year - 1) * 12;
    const endMonth = Math.min(year * 12, tenureMonths);
    let principalPaid = 0;
    let interestPaid = 0;

    for (let i = startMonth; i < endMonth; i++) {
      principalPaid += monthly[i]!.principalPaid;
      interestPaid += monthly[i]!.interestPaid;
    }

    const monthsRemaining = tenureMonths - endMonth;
    let outstandingBalance = loanAmount;
    for (let i = 0; i < endMonth; i++) {
      outstandingBalance = roundCurrency(outstandingBalance - monthly[i]!.principalPaid);
    }

    summary.push({
      year,
      principalPaid: roundCurrency(principalPaid),
      interestPaid: roundCurrency(interestPaid),
      outstandingBalance: monthsRemaining > 0 ? outstandingBalance : 0,
    });
  }

  return summary;
}
