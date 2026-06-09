import type { CalculateEligibilityInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { lenderRepository } from '../../product/repositories/lender.repository.js';
import { eligibilityRuleService } from '../../product/services/eligibility-rule.service.js';
import {
  DEFAULT_FOIR_CAP_PCT,
  DEFAULT_LTV_CAPS,
  FINANCE_ENGINE_VERSION,
} from '../constants/finance-engine.constants.js';
import type { EligibilityCalculationResult } from '../types/finance-engine.types.js';
import { calculateEmi } from '../utils/emi-math.utils.js';
import {
  clampAmount,
  computeDscr,
  computeFoir,
  computeLtv,
  computeMonthlyIncome,
  resolveProductFromSlug,
  roundCurrency,
  roundPct,
} from '../utils/finance-engine.utils.js';

interface ProductContext {
  productId: string;
  variantId: string | null;
  productSlug?: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  minInterestRate: number | null;
  maxInterestRate: number | null;
}

export const eligibilityCalculatorService = {
  async calculate(input: CalculateEligibilityInput): Promise<EligibilityCalculationResult> {
    const productCtx = await resolveProductContext(input);
    const monthlyIncome = computeMonthlyIncome(input.monthlyIncome, input.annualIncome);
    const existingEmi = input.existingEmi ?? input.existingObligations;
    const interestRate = input.interestRate ?? productCtx.maxInterestRate ?? productCtx.minInterestRate ?? 10;
    const tenureMonths = input.requestedTenureMonths ?? productCtx.maxTenureMonths;

    const incomeBasedCap = monthlyIncome
      ? roundCurrency((monthlyIncome * (DEFAULT_FOIR_CAP_PCT / 100) - existingEmi) / calculateEmiFactor(interestRate, tenureMonths))
      : productCtx.maxAmount;

    const ltvCapPct = input.productSlug ? DEFAULT_LTV_CAPS[input.productSlug] ?? 0 : 0;
    const assetValue = input.propertyValue ?? input.vehicleValue ?? null;
    const ltvBasedCap =
      ltvCapPct > 0 && assetValue ? roundCurrency((assetValue * ltvCapPct) / 100) : productCtx.maxAmount;

    let eligibleAmount = clampAmount(
      Math.min(incomeBasedCap, ltvBasedCap, productCtx.maxAmount),
      productCtx.minAmount,
      productCtx.maxAmount,
    );

    if (input.requestedLoanAmount) {
      eligibleAmount = Math.min(eligibleAmount, input.requestedLoanAmount);
    }

    const proposedEmi = calculateEmi(eligibleAmount, interestRate, tenureMonths);
    const foir = computeFoir(monthlyIncome, existingEmi, proposedEmi);
    const ltv = computeLtv(eligibleAmount, assetValue);
    const dscr = computeDscr(input.annualBusinessProfit, input.annualDebtService);

    const evaluation = await eligibilityRuleService.evaluate({
      productId: productCtx.productId,
      variantId: productCtx.variantId ?? undefined,
      applicant: {
        age: input.age,
        monthlyIncome: input.monthlyIncome,
        annualIncome: input.annualIncome,
        employmentType: input.employmentType,
        businessVintageMonths: input.businessVintageMonths,
        turnover: input.turnover,
        propertyValue: input.propertyValue,
        vehicleValue: input.vehicleValue,
        requestedLoanAmount: input.requestedLoanAmount ?? eligibleAmount,
        existingEmi,
        creditScore: input.creditScore,
        location: input.location,
      },
    });

    const riskScore = computeRiskScore({
      creditScore: input.creditScore,
      foir,
      ltv,
      dscr,
      outcome: evaluation.outcome,
      riskFlags: evaluation.riskFlags,
    });

    const approvalProbability = roundPct(
      Math.min(99, Math.max(5, evaluation.approvalProbability * 100 + (riskScore - 50) * 0.2)),
    );

    if (evaluation.outcome === 'NOT_ELIGIBLE') {
      eligibleAmount = 0;
    } else if (evaluation.outcome === 'CONDITIONALLY_ELIGIBLE') {
      eligibleAmount = roundCurrency(eligibleAmount * 0.85);
    }

    return {
      eligibleAmount,
      approvalProbability,
      outcome: evaluation.outcome,
      riskScore,
      foir,
      ltv,
      dscr,
      riskFlags: evaluation.riskFlags,
      failedRules: evaluation.failedRules,
      passedRules: evaluation.passedRules,
      productSlug: input.productSlug,
      productId: productCtx.productId,
      variantId: productCtx.variantId ?? undefined,
    };
  },

  async getRecommendedLenders(productId: string, limit = 5) {
    return lenderRepository.list(
      { isActive: true, policies: { some: { productId, isActive: true } } },
      0,
      limit,
      { name: 'asc' },
    );
  },
};

async function resolveProductContext(input: CalculateEligibilityInput): Promise<ProductContext> {
  if (input.productId) {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, deletedAt: null, isActive: true },
      include: {
        variants: input.variantId
          ? { where: { id: input.variantId, isActive: true }, take: 1 }
          : { where: { isActive: true }, take: 1 },
      },
    });
    if (!product) throw new NotFoundError('Product', input.productId!);

    return {
      productId: product.id,
      variantId: input.variantId ?? product.variants[0]?.id ?? null,
      productSlug: input.productSlug,
      minAmount: Number(product.minAmount),
      maxAmount: Number(product.maxAmount),
      minTenureMonths: product.minTenureMonths,
      maxTenureMonths: product.maxTenureMonths,
      minInterestRate: product.minInterestRate ? Number(product.minInterestRate) : null,
      maxInterestRate: product.maxInterestRate ? Number(product.maxInterestRate) : null,
    };
  }

  const resolved = await resolveProductFromSlug(input.productSlug!);
  return { ...resolved, productSlug: input.productSlug };
}

function calculateEmiFactor(annualRatePct: number, tenureMonths: number): number {
  if (annualRatePct === 0) return 1 / tenureMonths;
  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  return (r * factor) / (factor - 1);
}

function computeRiskScore(params: {
  creditScore?: number;
  foir: number | null;
  ltv: number | null;
  dscr: number | null;
  outcome: string;
  riskFlags: string[];
}): number {
  let score = 70;

  if (params.creditScore !== undefined) {
    if (params.creditScore >= 750) score += 15;
    else if (params.creditScore >= 700) score += 8;
    else if (params.creditScore >= 650) score += 2;
    else if (params.creditScore < 600) score -= 20;
    else score -= 10;
  }

  if (params.foir !== null) {
    if (params.foir <= 40) score += 8;
    else if (params.foir <= 50) score += 3;
    else if (params.foir > 60) score -= 15;
    else score -= 5;
  }

  if (params.ltv !== null) {
    if (params.ltv <= 60) score += 5;
    else if (params.ltv > 80) score -= 10;
  }

  if (params.dscr !== null) {
    if (params.dscr >= 1.5) score += 8;
    else if (params.dscr < 1) score -= 15;
  }

  if (params.outcome === 'NOT_ELIGIBLE') score -= 30;
  else if (params.outcome === 'CONDITIONALLY_ELIGIBLE') score -= 10;

  score -= Math.min(params.riskFlags.length * 3, 15);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export { FINANCE_ENGINE_VERSION };
