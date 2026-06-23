import {
  buildAmortizationYearSummary,
  buildEmiBreakdown as buildSharedEmiBreakdown,
  calculateEmi as calculateSharedEmi,
} from '@kuberone/shared-utils';

import type { AmortizationYearSummary, EmiBreakdown } from '../types/finance-engine.types.js';

export function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  return calculateSharedEmi(principal, annualRatePct, tenureMonths);
}

export function buildEmiBreakdown(
  loanAmount: number,
  interestRate: number,
  tenureMonths: number,
  processingFee: number,
): EmiBreakdown {
  return buildSharedEmiBreakdown(loanAmount, interestRate, tenureMonths, processingFee);
}

export function buildAmortizationSummary(
  loanAmount: number,
  interestRate: number,
  tenureMonths: number,
): AmortizationYearSummary[] {
  return buildAmortizationYearSummary(loanAmount, interestRate, tenureMonths);
}
