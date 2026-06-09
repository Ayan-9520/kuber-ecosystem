import type { LeadGrade, LeadRiskRating } from '@kuberone/database';

interface PredictionInput {
  score: number;
  grade: LeadGrade;
  approvalProbability: number;
  disbursalProbability: number;
  riskRating: LeadRiskRating;
  documentCompletenessPct?: number;
  leadStatus?: string;
  creditScore?: number;
}

export const predictionEngineService = {
  predict(input: PredictionInput) {
    const docRisk = input.documentCompletenessPct !== undefined
      ? Math.max(5, 100 - input.documentCompletenessPct)
      : input.grade === 'A_PLUS' || input.grade === 'A' ? 20 : 45;

    const dropOffRisk = Math.max(
      5,
      Math.min(
        95,
        (input.grade === 'REJECTED' ? 85 : input.grade === 'C' ? 55 : 25) +
          (input.leadStatus === 'LOST' ? 40 : 0) +
          (input.riskRating === 'CRITICAL' ? 20 : input.riskRating === 'HIGH' ? 10 : 0),
      ),
    );

    const fraudRisk = Math.max(
      5,
      Math.min(
        90,
        (input.creditScore !== undefined && input.creditScore < 550 ? 40 : 10) +
          (input.riskRating === 'CRITICAL' ? 25 : 0) +
          (input.documentCompletenessPct !== undefined && input.documentCompletenessPct < 30 ? 15 : 0),
      ),
    );

    const conversionBoost = ['APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED', 'QUALIFIED'].includes(input.leadStatus ?? '') ? 15 : 0;

    return {
      approval: input.approvalProbability,
      disbursal: input.disbursalProbability,
      conversion: Math.min(99, Math.round(input.score * 0.65 + conversionBoost)),
      dropOff: dropOffRisk,
      document: docRisk,
      fraud: fraudRisk,
    };
  },
};
