import type { LeadRiskRating } from '@kuberone/database';

import { RISK_THRESHOLDS } from '../constants/lead-scoring.constants.js';

interface RiskInput {
  riskIndicators: string[];
  score: number;
  creditScore?: number;
  foir?: number;
  documentCompletenessPct?: number;
}

export const riskEngineService = {
  assess(input: RiskInput): { riskRating: LeadRiskRating; riskScore: number; riskFactors: Record<string, number> } {
    const riskFactors: Record<string, number> = {};
    let riskScore = 0;

    riskScore += input.riskIndicators.length * 12;
    riskFactors.indicatorCount = input.riskIndicators.length * 12;

    if (input.creditScore !== undefined && input.creditScore < 650) {
      riskFactors.cibil = 25;
      riskScore += 25;
    }
    if (input.creditScore !== undefined && input.creditScore < 550) {
      riskFactors.criticalCibil = 35;
      riskScore += 35;
    }

    if (input.foir !== undefined && input.foir > 55) {
      riskFactors.foir = 20;
      riskScore += 20;
    }

    if (input.documentCompletenessPct !== undefined && input.documentCompletenessPct < 50) {
      riskFactors.documents = 15;
      riskScore += 15;
    }

    riskScore += Math.max(0, 100 - input.score) * 0.3;
    riskFactors.lowScore = Math.round(Math.max(0, 100 - input.score) * 0.3);

    riskScore = Math.min(100, Math.round(riskScore));

    let riskRating: LeadRiskRating = 'LOW';
    if (riskScore >= RISK_THRESHOLDS.CRITICAL) riskRating = 'CRITICAL';
    else if (riskScore >= RISK_THRESHOLDS.HIGH) riskRating = 'HIGH';
    else if (riskScore >= RISK_THRESHOLDS.MEDIUM) riskRating = 'MEDIUM';

    return { riskRating, riskScore, riskFactors };
  },
};
