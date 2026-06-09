import type { LeadGrade } from '@kuberone/database';
import type { ScoringProfile } from '@kuberone/shared-validation';

import {
  DEFAULT_MODEL_VERSION,
  SCORING_FACTOR_WEIGHTS,
} from '../constants/leads.constants.js';
import type { LeadScoringResult } from '../types/leads.types.js';
import { scoreToGrade } from '../utils/leads.utils.js';

const TIER1_CITIES = ['MUMBAI', 'DELHI', 'BANGALORE', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'PUNE', 'KOLKATA'];

function normalizeScore(value: number, min: number, max: number): number {
  if (max <= min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export const leadScoringEngineService = {
  score(profile: ScoringProfile, aiScore = 50): LeadScoringResult {
    const riskIndicators: string[] = [];
    const factorBreakdown: LeadScoringResult['factorBreakdown'] = {};

    const monthlyIncome =
      profile.monthlyIncome ?? (profile.annualIncome ? profile.annualIncome / 12 : undefined);

    if (monthlyIncome !== undefined) {
      const score = normalizeScore(monthlyIncome, 15000, 200000);
      const weight = SCORING_FACTOR_WEIGHTS.income;
      factorBreakdown.income = { score, weight, weighted: score * weight };
      if (monthlyIncome < 25000) riskIndicators.push('Low income band');
    }

    if (profile.propertyValue !== undefined) {
      const score = normalizeScore(profile.propertyValue, 1000000, 50000000);
      const weight = SCORING_FACTOR_WEIGHTS.propertyValue;
      factorBreakdown.propertyValue = { score, weight, weighted: score * weight };
    }

    if (profile.vehicleValue !== undefined) {
      const score = normalizeScore(profile.vehicleValue, 200000, 5000000);
      const weight = SCORING_FACTOR_WEIGHTS.vehicleValue;
      factorBreakdown.vehicleValue = { score, weight, weighted: score * weight };
    }

    if (profile.businessTurnover !== undefined) {
      const score = normalizeScore(profile.businessTurnover, 500000, 50000000);
      const weight = SCORING_FACTOR_WEIGHTS.businessTurnover;
      factorBreakdown.businessTurnover = { score, weight, weighted: score * weight };
      if (profile.businessTurnover < 1000000) riskIndicators.push('Low business turnover');
    }

    if (profile.loanAmount !== undefined && monthlyIncome !== undefined && monthlyIncome > 0) {
      const ratio = profile.loanAmount / (monthlyIncome * 12);
      const score = ratio <= 5 ? 90 : ratio <= 10 ? 60 : ratio <= 20 ? 35 : 10;
      const weight = SCORING_FACTOR_WEIGHTS.loanAmount;
      factorBreakdown.loanAmount = { score, weight, weighted: score * weight };
      if (ratio > 15) riskIndicators.push('High loan-to-income ratio');
    }

    if (profile.location) {
      const loc = profile.location.toUpperCase();
      const score = TIER1_CITIES.some((c) => loc.includes(c)) ? 85 : 55;
      const weight = SCORING_FACTOR_WEIGHTS.location;
      factorBreakdown.location = { score, weight, weighted: score * weight };
    }

    if (profile.occupation) {
      const occ = profile.occupation.toUpperCase();
      const score =
        occ.includes('SALARIED') || occ.includes('GOVT') ? 80 : occ.includes('SELF') ? 65 : 50;
      const weight = SCORING_FACTOR_WEIGHTS.occupation;
      factorBreakdown.occupation = { score, weight, weighted: score * weight };
    }

    if (profile.productType) {
      const score = 70;
      const weight = SCORING_FACTOR_WEIGHTS.productType;
      factorBreakdown.productType = { score, weight, weighted: score * weight };
    }

    if (profile.creditScore !== undefined) {
      const score = normalizeScore(profile.creditScore, 550, 850);
      const weight = SCORING_FACTOR_WEIGHTS.creditScore;
      factorBreakdown.creditScore = { score, weight, weighted: score * weight };
      if (profile.creditScore < 650) riskIndicators.push('Below preferred CIBIL threshold');
      if (profile.creditScore < 550) riskIndicators.push('Critical CIBIL score');
    }

    const totalWeight = Object.values(factorBreakdown).reduce((s, f) => s + f.weight, 0);
    const ruleScore =
      totalWeight > 0
        ? Math.round(
            Object.values(factorBreakdown).reduce((s, f) => s + f.weighted, 0) / totalWeight,
          )
        : 50;

    const combined = Math.round(ruleScore * 0.7 + aiScore * 0.3);
    const grade = scoreToGrade(combined) as LeadGrade;

    const approvalProbabilityMap: Record<string, number> = {
      A_PLUS: 85,
      A: 70,
      B: 50,
      C: 30,
      REJECTED: 5,
    };

    if (grade === 'REJECTED') {
      riskIndicators.push('Lead grade rejected — limited outreach');
    }

    return {
      score: combined,
      grade,
      ruleScore,
      aiScore,
      approvalProbability: approvalProbabilityMap[grade] ?? 30,
      riskIndicators,
      factorBreakdown,
      modelVersion: DEFAULT_MODEL_VERSION,
    };
  },
};
