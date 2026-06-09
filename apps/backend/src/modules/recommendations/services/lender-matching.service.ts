import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { RECOMMENDATION_MODEL_VERSION } from '../constants/recommendations.constants.js';
import type { CustomerProfile, LenderMatchResult, RequestContext } from '../types/recommendations.types.js';

export const lenderMatchingService = {
  async match(profile: CustomerProfile, _ctx: RequestContext): Promise<LenderMatchResult[]> {
    if (!profile.productId || !profile.loanAmount) return [];

    const tenure = 240;
    const rate = 9.5;
    const lenders = await financeEngineService.ai.getLenderRecommendations(
      profile.productId,
      profile.loanAmount,
      rate,
      tenure,
    );

    return lenders.slice(0, 5).map((l, idx) => ({
      lenderId: l.lenderId,
      lenderName: l.lenderName,
      rankScore: l.score,
      rankPosition: idx + 1,
      approvalProbability: Math.min(99, l.score + (profile.leadScore ? profile.leadScore * 0.1 : 0)),
      expectedRoi: Math.round(l.score * 0.15 * 100) / 100,
      expectedTatDays: l.score >= 85 ? 5 : l.score >= 70 ? 10 : 15,
      estimatedEmi: l.estimatedEmi ?? undefined,
      reason: l.reason,
    }));
  },

  modelVersion: RECOMMENDATION_MODEL_VERSION,
};
