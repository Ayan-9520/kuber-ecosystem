import type { CalculateLoanComparisonInput } from '@kuberone/shared-validation';

import type { LoanComparisonOfferResult, LoanComparisonResult } from '../types/finance-engine.types.js';
import { buildEmiBreakdown } from '../utils/emi-math.utils.js';
import { roundCurrency } from '../utils/finance-engine.utils.js';

export const loanComparisonEngineService = {
  compare(input: CalculateLoanComparisonInput): LoanComparisonResult {
    const scored = input.offers.map((offer) => {
      const breakdown = buildEmiBreakdown(
        offer.loanAmount,
        offer.interestRate,
        offer.tenureMonths,
        offer.processingFee,
      );

      let score = 100;
      score -= breakdown.emi * 0.001;
      score -= breakdown.interestPayable * 0.00001;
      score -= offer.processingFee * 0.01;
      if (offer.turnaroundDays !== undefined) {
        score -= offer.turnaroundDays * 0.5;
      }

      return {
        label: offer.label,
        lenderId: offer.lenderId,
        lenderCode: offer.lenderCode,
        lenderName: offer.lenderName,
        loanAmount: offer.loanAmount,
        interestRate: offer.interestRate,
        tenureMonths: offer.tenureMonths,
        emi: breakdown.emi,
        totalRepayment: breakdown.totalRepayment,
        totalInterest: breakdown.interestPayable,
        processingFee: offer.processingFee,
        score: roundCurrency(score),
        rank: 0,
      } satisfies LoanComparisonOfferResult;
    });

    const sortKey = input.rankBy;
    scored.sort((a, b) => {
      if (sortKey === 'emi') return a.emi - b.emi;
      if (sortKey === 'totalRepayment') return a.totalRepayment - b.totalRepayment;
      if (sortKey === 'processingFee') return a.processingFee - b.processingFee;
      const ta = input.offers.find((o) => o.label === a.label)?.turnaroundDays ?? 999;
      const tb = input.offers.find((o) => o.label === b.label)?.turnaroundDays ?? 999;
      return ta - tb;
    });

    scored.forEach((offer, index) => {
      offer.rank = index + 1;
    });

    return {
      offers: scored,
      bestOfferLabel: scored[0]?.label ?? '',
      rankBy: sortKey,
    };
  },
};
