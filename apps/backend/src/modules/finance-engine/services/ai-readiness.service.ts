import type {
  CalculateApprovalProbabilityInput,
  CalculateEligibilityInput,
  CalculateEmiInput,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { PRODUCT_SLUG_MAP } from '../constants/finance-engine.constants.js';
import type {
  AiAdvisorPayload,
  LenderRecommendation,
  ProductRecommendation,
} from '../types/finance-engine.types.js';

import { approvalProbabilityEngineService } from './approval-probability-engine.service.js';
import { eligibilityCalculatorService } from './eligibility-calculator.service.js';
import { emiCalculatorService } from './emi-calculator.service.js';

export const aiReadinessService = {
  buildEmiAdvisor(input: CalculateEmiInput): AiAdvisorPayload {
    const result = emiCalculatorService.calculate(input);
    return {
      summary: `Estimated EMI is ₹${result.emi.toLocaleString('en-IN')} for ₹${result.loanAmount.toLocaleString('en-IN')} over ${result.tenureMonths} months at ${result.interestRate}%`,
      metrics: {
        emi: result.emi,
        totalRepayment: result.totalRepayment,
        interestPayable: result.interestPayable,
        totalCost: result.totalCost,
      },
      recommendations: [
        result.interestPayable > result.principal * 0.5
          ? 'Consider shorter tenure to reduce interest burden'
          : 'Interest burden is within reasonable range',
        input.processingFee > result.emi * 2
          ? 'Processing fee is high relative to EMI — negotiate with lender'
          : 'Processing fee appears reasonable',
      ],
      riskFlags: [],
    };
  },

  async buildEligibilityAdvisor(input: CalculateEligibilityInput): Promise<AiAdvisorPayload> {
    const result = await eligibilityCalculatorService.calculate(input);
    return {
      summary: `Eligibility outcome: ${result.outcome}. Eligible up to ₹${result.eligibleAmount.toLocaleString('en-IN')} with ${result.approvalProbability}% approval probability`,
      metrics: {
        eligibleAmount: result.eligibleAmount,
        approvalProbability: result.approvalProbability,
        foir: result.foir,
        ltv: result.ltv,
        dscr: result.dscr,
        riskScore: result.riskScore,
      },
      recommendations: buildEligibilityRecommendations(result),
      riskFlags: result.riskFlags,
    };
  },

  async getLenderRecommendations(
    productId: string,
    loanAmount: number,
    interestRate: number,
    tenureMonths: number,
  ): Promise<LenderRecommendation[]> {
    const lenders = await eligibilityCalculatorService.getRecommendedLenders(productId, 10);
    const policies = await prisma.lenderPolicy.findMany({
      where: { productId, isActive: true, lenderId: { in: lenders.map((l) => l.id) } },
      include: { lender: true },
    });

    return policies
      .map((policy) => {
        const rate = interestRate;
        const emiResult = emiCalculatorService.calculate({
          loanAmount,
          interestRate: rate,
          tenureMonths,
          processingFee: policy.processingFeePct ? (loanAmount * Number(policy.processingFeePct)) / 100 : 0,
          includeAmortization: false,
          persist: false,
          useCache: false,
        });

        let score = 70;
        if (policy.minCibil) score += 5;
        if (policy.turnaroundDays && policy.turnaroundDays <= 7) score += 10;
        if (policy.commissionRate) score += 5;
        if (loanAmount >= Number(policy.minAmount) && loanAmount <= Number(policy.maxAmount)) score += 10;

        return {
          lenderId: policy.lender.id,
          lenderCode: policy.lender.code,
          lenderName: policy.lender.name,
          score,
          estimatedEmi: emiResult.emi,
          reason: `Active policy for product with TAT ${policy.turnaroundDays ?? 'N/A'} days`,
        };
      })
      .sort((a, b) => b.score - a.score);
  },

  async getProductRecommendations(profile: {
    monthlyIncome?: number;
    creditScore?: number;
    propertyValue?: number;
    vehicleValue?: number;
    preferredSegment?: 'HOME' | 'AUTO' | 'BUSINESS';
  }): Promise<ProductRecommendation[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      include: { family: true },
    });

    const recommendations: ProductRecommendation[] = [];

    for (const [slug, mapping] of Object.entries(PRODUCT_SLUG_MAP)) {
      const product = products.find((p) => p.code === mapping.productCode);
      if (!product) continue;

      if (profile.preferredSegment === 'HOME' && product.family.code !== 'HL' && product.family.code !== 'LAP') {
        continue;
      }
      if (profile.preferredSegment === 'AUTO' && product.family.code !== 'AL') continue;
      if (profile.preferredSegment === 'BUSINESS' && product.family.code !== 'BL') continue;

      let score = 50;
      if (profile.creditScore && profile.creditScore >= 700) score += 15;
      if (profile.monthlyIncome && profile.monthlyIncome >= 50000) score += 10;
      if (profile.propertyValue && slug.includes('HOME')) score += 20;
      if (profile.vehicleValue && slug.includes('CAR')) score += 20;

      recommendations.push({
        productSlug: slug,
        productName: product.name,
        score,
        reason: `Matches ${product.family.name} segment with configured limits ₹${Number(product.minAmount).toLocaleString('en-IN')} – ₹${Number(product.maxAmount).toLocaleString('en-IN')}`,
      });
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  },

  async buildApprovalAdvisor(input: CalculateApprovalProbabilityInput): Promise<AiAdvisorPayload> {
    const result = await approvalProbabilityEngineService.calculate(input);
    return {
      summary: `Approval grade ${result.grade.replace('_', '+')} at ${result.approvalPercentage}% probability`,
      metrics: {
        grade: result.grade,
        approvalPercentage: result.approvalPercentage,
        eligibleAmount: result.eligibleAmount,
        foir: result.foir,
        ltv: result.ltv,
      },
      recommendations: [result.recommendation],
      riskFlags: result.riskFlags,
    };
  },
};

function buildEligibilityRecommendations(result: {
  outcome: string;
  foir: number | null;
  ltv: number | null;
  eligibleAmount: number;
}): string[] {
  const tips: string[] = [];
  if (result.outcome === 'NOT_ELIGIBLE') {
    tips.push('Profile does not meet product rules — review failed rules or choose alternate product');
  }
  if (result.foir !== null && result.foir > 50) {
    tips.push('Reduce existing obligations or increase co-applicant income to improve FOIR');
  }
  if (result.ltv !== null && result.ltv > 75) {
    tips.push('Consider higher down payment to reduce LTV');
  }
  if (result.eligibleAmount > 0) {
    tips.push(`Sanction-ready amount estimate: ₹${result.eligibleAmount.toLocaleString('en-IN')}`);
  }
  return tips;
}
