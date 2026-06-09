import type { CalculateApprovalProbabilityInput } from '@kuberone/shared-validation';

import { APPROVAL_GRADE_THRESHOLDS } from '../constants/finance-engine.constants.js';
import type { ApprovalProbabilityResult } from '../types/finance-engine.types.js';
import { gradeFromScore, roundPct } from '../utils/finance-engine.utils.js';

import { eligibilityCalculatorService } from './eligibility-calculator.service.js';

export const approvalProbabilityEngineService = {
  async calculate(input: CalculateApprovalProbabilityInput): Promise<ApprovalProbabilityResult> {
    const eligibility = await eligibilityCalculatorService.calculate(input);

    let score = eligibility.riskScore;
    const riskFlags = [...eligibility.riskFlags];

    if (!input.documentsComplete) {
      score -= 12;
      riskFlags.push('Document set incomplete');
    }

    if (!input.kycVerified) {
      score -= 8;
      riskFlags.push('KYC not verified');
    }

    if (input.creditScore !== undefined && input.creditScore < 650) {
      riskFlags.push('Sub-optimal credit score');
    }

    if (eligibility.foir !== null && eligibility.foir > 55) {
      riskFlags.push('Elevated FOIR');
    }

    score = Math.max(0, Math.min(100, score));
    const grade = gradeFromScore(score);

    let approvalPercentage = roundPct(score);
    if (grade === 'REJECTED') {
      approvalPercentage = roundPct(Math.min(approvalPercentage, APPROVAL_GRADE_THRESHOLDS.C - 1));
    }

    const recommendation =
      grade === 'A_PLUS' || grade === 'A'
        ? 'Strong approval candidate — proceed with lender login'
        : grade === 'B'
          ? 'Moderate approval likelihood — consider alternate lenders or co-applicant'
          : grade === 'C'
            ? 'Weak profile — improve credit/FOIR or reduce loan amount'
            : 'Not recommended for sanction at current profile';

    return {
      grade,
      approvalPercentage,
      riskScore: score,
      riskFlags,
      eligibleAmount: eligibility.eligibleAmount,
      foir: eligibility.foir,
      ltv: eligibility.ltv,
      dscr: eligibility.dscr,
      recommendation,
    };
  },
};
