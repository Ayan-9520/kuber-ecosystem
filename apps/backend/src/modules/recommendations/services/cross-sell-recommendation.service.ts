import { crossSellService } from '../../ai-copilot/services/copilot-engines.service.js';
import { CROSS_SELL_PRODUCTS, RECOMMENDATION_MODEL_VERSION } from '../constants/recommendations.constants.js';
import type { CrossSellResult, CustomerProfile } from '../types/recommendations.types.js';

export const crossSellRecommendationService = {
  detect(profile: CustomerProfile, approvalProbability: number): CrossSellResult[] {
    const items = crossSellService.detect({
      approvalProbability,
      productSlug: profile.productType,
      propertyValue: profile.propertyValue,
      vehicleValue: profile.vehicleValue,
      businessTurnover: profile.businessTurnover,
      hasExistingLoan: profile.applicationStatus === 'DISBURSED',
    });

    return items.map((item, idx) => ({
      productCode: item.code,
      label: item.label,
      description: item.description,
      matchScore: item.score,
      rankPosition: idx + 1,
    }));
  },

  listCatalog() {
    return CROSS_SELL_PRODUCTS;
  },

  modelVersion: RECOMMENDATION_MODEL_VERSION,
};
