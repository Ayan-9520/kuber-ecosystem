import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { emiCalculatorService } from '../../finance-engine/services/emi-calculator.service.js';
import { RECOMMENDATION_MODEL_VERSION } from '../constants/recommendations.constants.js';
import type { CustomerProfile, ProductMatchResult, RequestContext } from '../types/recommendations.types.js';

export const productMatchingService = {
  async match(profile: CustomerProfile, _ctx: RequestContext): Promise<ProductMatchResult[]> {
    const products = await financeEngineService.ai.getProductRecommendations({
      monthlyIncome: profile.monthlyIncome,
      creditScore: profile.creditScore,
      propertyValue: profile.propertyValue,
      vehicleValue: profile.vehicleValue,
    });

    const tenure = profile.loanAmount && profile.loanAmount > 5000000 ? 240 : 180;
    const amount = profile.loanAmount ?? (profile.monthlyIncome ? profile.monthlyIncome * 60 : 1000000);
    const rate = 9.5;

    const emi = emiCalculatorService.calculate({
      loanAmount: amount,
      interestRate: rate,
      tenureMonths: tenure,
      processingFee: 0,
      includeAmortization: false,
      persist: false,
      useCache: true,
    });

    return products.slice(0, 5).map((p, idx) => ({
      productId: undefined,
      productName: p.productName,
      rankScore: p.score,
      rankPosition: idx + 1,
      recommendedAmount: amount,
      recommendedTenure: tenure,
      recommendedEmi: emi.emi,
      approvalProbability: Math.min(99, p.score + (profile.leadScore ? profile.leadScore * 0.08 : 0)),
      reason: p.reason,
    }));
  },

  modelVersion: RECOMMENDATION_MODEL_VERSION,
};
