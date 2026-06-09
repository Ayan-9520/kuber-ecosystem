import type { RecommendationRiskLevel } from '@kuberone/database';

import type { CustomerProfile, RiskRecResult } from '../types/recommendations.types.js';

export const riskRecommendationService = {
  assess(profile: CustomerProfile): RiskRecResult {
    const explanations: string[] = [];
    const mitigations: string[] = [];
    let riskScore = 0;

    if (profile.creditScore !== undefined && profile.creditScore < 650) {
      riskScore += 25;
      explanations.push('CIBIL below preferred threshold');
      mitigations.push('Request credit improvement plan or co-applicant');
    }
    if (profile.foir !== undefined && profile.foir > 55) {
      riskScore += 20;
      explanations.push('High FOIR impacts approval');
      mitigations.push('Consider lower loan amount or longer tenure');
    }
    if ((profile.documentCompletenessPct ?? 100) < 50) {
      riskScore += 15;
      explanations.push('Incomplete documentation');
      mitigations.push('Prioritize document collection before bank login');
    }
    if ((profile.leadScore ?? 100) < 50) {
      riskScore += 20;
      explanations.push('Low lead score indicates weak profile fit');
      mitigations.push('Re-qualify customer or suggest alternate product');
    }
    if (profile.ltv !== undefined && profile.ltv > 85) {
      riskScore += 15;
      explanations.push('High LTV increases lender risk');
      mitigations.push('Increase down payment or reduce loan amount');
    }

    riskScore = Math.min(100, riskScore);

    let riskLevel: RecommendationRiskLevel = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 55) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    if (mitigations.length === 0) mitigations.push('Profile within acceptable risk parameters');

    return { riskLevel, riskScore, explanations, mitigations };
  },
};
