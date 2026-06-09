import type { ProductRecommendationInput } from '@kuberone/shared-validation';

import { eligibilityRuleRepository } from '../repositories/eligibility-rule.repository.js';
import { lenderPolicyRepository } from '../repositories/lender-policy.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import type { ProductRecommendationResult } from '../types/product.types.js';

import { eligibilityEngineService } from './eligibility-engine.service.js';

export const productRecommendationService = {
  async recommend(input: ProductRecommendationInput): Promise<ProductRecommendationResult> {
    const products = await productRepository.list(
      { deletedAt: null, isActive: true },
      0,
      50,
      { priority: 'asc' },
    );

    const applicant = {
      monthlyIncome: input.requestedAmount ? input.requestedAmount * 0.01 : undefined,
      employmentType: input.employmentType,
      creditScore: input.creditScore,
      propertyValue: input.propertyValue,
      vehicleValue: input.vehicleValue,
      requestedLoanAmount: input.requestedAmount,
    };

    const recommendations: ProductRecommendationResult['products'] = [];

    for (const product of products) {
      const rules = await eligibilityRuleRepository.listActiveForProduct(product.id);
      const ruleResults = rules.map((rule) => {
        const definition = rule.ruleDefinition as Record<string, unknown>;
        const result = eligibilityEngineService.evaluateRule(
          rule.ruleName,
          definition as never,
          applicant,
        );
        return { ruleName: rule.ruleName, ...result };
      });

      const evaluation = eligibilityEngineService.aggregate(
        ruleResults,
        Number(product.maxAmount),
      );

      if (evaluation.outcome === 'NOT_ELIGIBLE') continue;

      const policies = await lenderPolicyRepository.listActiveForProduct(product.id);
      const recommendedLenders = policies
        .map((policy) => ({
          lenderId: policy.lenderId,
          lenderName: policy.lender.name,
          score: Math.min(
            100,
            (policy.minCibil ? (input.creditScore ?? 700) - policy.minCibil + 50 : 70) +
              evaluation.approvalProbability * 30,
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const score =
        evaluation.approvalProbability * 70 +
        (product.priority === 'P0' ? 20 : product.priority === 'P1' ? 15 : 10);

      recommendations.push({
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        score: Math.round(score),
        approvalProbability: evaluation.approvalProbability,
        recommendedLenders,
        riskIndicators: evaluation.riskFlags.slice(0, 5),
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    return { products: recommendations.slice(0, 10) };
  },
};
