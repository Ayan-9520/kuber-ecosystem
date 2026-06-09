import type { Prisma } from '@kuberone/database';
import type {
  CalculateApprovalProbabilityInput,
  CalculateEligibilityInput,
  CalculateEmiInput,
  CalculateLoanComparisonInput,
  CalculateSavingsInput,
  ListFinanceCalculationsQuery,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { FINANCE_ENGINE_VERSION } from '../constants/finance-engine.constants.js';
import {
  approvalProbabilityRepository,
  eligibilityCalculationRepository,
  emiCalculationRepository,
  financeCalculationRepository,
  loanComparisonRepository,
  savingsCalculationRepository,
} from '../repositories/finance-calculation.repository.js';
import type { RequestContext } from '../types/finance-engine.types.js';
import {
  auditFinanceMutation,
  buildCacheKey,
  buildPaginationMeta,
  resolveProductFromSlug,
} from '../utils/finance-engine.utils.js';

import { aiReadinessService } from './ai-readiness.service.js';
import { approvalProbabilityEngineService } from './approval-probability-engine.service.js';
import { financeCacheService } from './cache.service.js';
import { eligibilityCalculatorService } from './eligibility-calculator.service.js';
import { emiCalculatorService } from './emi-calculator.service.js';
import { loanComparisonEngineService } from './loan-comparison-engine.service.js';
import { savingsCalculatorService } from './savings-calculator.service.js';


export const financeEngineService = {
  async calculateEmi(input: CalculateEmiInput, ctx: RequestContext) {
    const cacheKey = input.useCache ? buildCacheKey('EMI', input) : null;

    if (cacheKey) {
      const cached = financeCacheService.get<{ result: Record<string, unknown>; calculationId?: string }>(cacheKey);
      if (cached) return { ...cached.result, cached: true, calculationId: cached.calculationId };
    }

    let productId = input.productId;
    let variantId: string | null = null;
    if (input.productSlug && !productId) {
      const resolved = await resolveProductFromSlug(input.productSlug);
      productId = resolved.productId;
      variantId = resolved.variantId;
    }

    const result = emiCalculatorService.calculate(input);
    const advisor = aiReadinessService.buildEmiAdvisor(input);
    const payload = { ...result, advisor, engineVersion: FINANCE_ENGINE_VERSION };

    let calculationId: string | undefined;
    if (input.persist) {
      const record = await emiCalculationRepository.create(
        buildRecord('EMI', input, payload, ctx, cacheKey, {
          productSlug: input.productSlug as never,
          productId,
          variantId,
          customerId: input.customerId,
          leadId: input.leadId,
          applicationId: input.applicationId,
        }),
      );
      calculationId = record.id;
      await auditFinanceMutation(authAuditRepository.log, ctx, 'EMI_CALCULATED', record.id, {
        loanAmount: input.loanAmount,
        emi: result.emi,
      });
    }

    if (cacheKey) {
      financeCacheService.set(cacheKey, { result: payload, calculationId });
    }

    return { ...payload, cached: false, calculationId };
  },

  async calculateEligibility(input: CalculateEligibilityInput, ctx: RequestContext) {
    const cacheKey = input.useCache ? buildCacheKey('ELIGIBILITY', input) : null;

    if (cacheKey) {
      const cached = financeCacheService.get<{ result: Record<string, unknown>; calculationId?: string }>(cacheKey);
      if (cached) return { ...cached.result, cached: true, calculationId: cached.calculationId };
    }

    const result = await eligibilityCalculatorService.calculate(input);
    const advisor = await aiReadinessService.buildEligibilityAdvisor(input);
    const lenderRecommendations =
      result.productId && result.eligibleAmount > 0
        ? await aiReadinessService.getLenderRecommendations(
            result.productId,
            result.eligibleAmount,
            input.interestRate ?? 10,
            input.requestedTenureMonths ?? 240,
          )
        : [];

    const payload = {
      ...result,
      advisor,
      lenderRecommendations,
      engineVersion: FINANCE_ENGINE_VERSION,
    };

    let calculationId: string | undefined;
    if (input.persist) {
      const record = await eligibilityCalculationRepository.create(
        buildRecord('ELIGIBILITY', input, payload, ctx, cacheKey, {
          productSlug: input.productSlug as never,
          productId: result.productId,
          variantId: result.variantId,
          customerId: input.customerId,
          leadId: input.leadId,
          applicationId: input.applicationId,
        }),
      );
      calculationId = record.id;
      await auditFinanceMutation(authAuditRepository.log, ctx, 'ELIGIBILITY_CALCULATED', record.id, {
        outcome: result.outcome,
        eligibleAmount: result.eligibleAmount,
      });
    }

    if (cacheKey) {
      financeCacheService.set(cacheKey, { result: payload, calculationId });
    }

    return { ...payload, cached: false, calculationId };
  },

  async calculateSavings(input: CalculateSavingsInput, ctx: RequestContext) {
    const cacheKey = input.useCache ? buildCacheKey('SAVINGS', input) : null;

    if (cacheKey) {
      const cached = financeCacheService.get<{ result: Record<string, unknown>; calculationId?: string }>(cacheKey);
      if (cached) return { ...cached.result, cached: true, calculationId: cached.calculationId };
    }

    const result = savingsCalculatorService.calculate(input);
    const payload = { ...result, engineVersion: FINANCE_ENGINE_VERSION };

    let calculationId: string | undefined;
    if (input.persist) {
      const record = await savingsCalculationRepository.create(
        buildRecord('SAVINGS', input, payload, ctx, cacheKey, {
          productSlug: input.productSlug as never,
          customerId: input.customerId,
          leadId: input.leadId,
          applicationId: input.applicationId,
        }),
      );
      calculationId = record.id;
      await auditFinanceMutation(authAuditRepository.log, ctx, 'SAVINGS_CALCULATED', record.id, {
        monthlySavings: result.monthlySavings,
      });
    }

    if (cacheKey) {
      financeCacheService.set(cacheKey, { result: payload, calculationId });
    }

    return { ...payload, cached: false, calculationId };
  },

  async compareLoans(input: CalculateLoanComparisonInput, ctx: RequestContext) {
    const cacheKey = input.useCache ? buildCacheKey('LOAN_COMPARISON', input) : null;

    if (cacheKey) {
      const cached = financeCacheService.get<{ result: Record<string, unknown>; calculationId?: string }>(cacheKey);
      if (cached) return { ...cached.result, cached: true, calculationId: cached.calculationId };
    }

    const result = loanComparisonEngineService.compare(input);
    const payload = { ...result, engineVersion: FINANCE_ENGINE_VERSION };

    let calculationId: string | undefined;
    if (input.persist) {
      const record = await loanComparisonRepository.create(
        buildRecord('LOAN_COMPARISON', input, payload, ctx, cacheKey, {
          productSlug: input.productSlug as never,
          productId: input.productId,
          customerId: input.customerId,
          leadId: input.leadId,
          applicationId: input.applicationId,
        }),
      );
      calculationId = record.id;
      await auditFinanceMutation(authAuditRepository.log, ctx, 'LOAN_COMPARISON', record.id, {
        bestOffer: result.bestOfferLabel,
      });
    }

    if (cacheKey) {
      financeCacheService.set(cacheKey, { result: payload, calculationId });
    }

    return { ...payload, cached: false, calculationId };
  },

  async calculateApprovalProbability(input: CalculateApprovalProbabilityInput, ctx: RequestContext) {
    const cacheKey = input.useCache ? buildCacheKey('APPROVAL_PROBABILITY', input) : null;

    if (cacheKey) {
      const cached = financeCacheService.get<{ result: Record<string, unknown>; calculationId?: string }>(cacheKey);
      if (cached) return { ...cached.result, cached: true, calculationId: cached.calculationId };
    }

    const result = await approvalProbabilityEngineService.calculate(input);
    const advisor = await aiReadinessService.buildApprovalAdvisor(input);
    const payload = { ...result, advisor, engineVersion: FINANCE_ENGINE_VERSION };

    let calculationId: string | undefined;
    if (input.persist) {
      const record = await approvalProbabilityRepository.create(
        buildRecord('APPROVAL_PROBABILITY', input, payload, ctx, cacheKey, {
          productSlug: input.productSlug as never,
          productId: input.productId,
          variantId: input.variantId,
          customerId: input.customerId,
          leadId: input.leadId,
          applicationId: input.applicationId,
        }),
      );
      calculationId = record.id;
      await auditFinanceMutation(authAuditRepository.log, ctx, 'APPROVAL_PROBABILITY', record.id, {
        grade: result.grade,
        approvalPercentage: result.approvalPercentage,
      });
    }

    if (cacheKey) {
      financeCacheService.set(cacheKey, { result: payload, calculationId });
    }

    return { ...payload, cached: false, calculationId };
  },

  async listCalculations(query: ListFinanceCalculationsQuery) {
    const where: Prisma.FinanceCalculationWhereInput = {
      ...(query.calculationKind ? { calculationKind: query.calculationKind as never } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.productSlug ? { productSlug: query.productSlug as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      financeCalculationRepository.list(where, skip, query.limit, orderBy),
      financeCalculationRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getCalculationById(id: string) {
    const record = await financeCalculationRepository.findById(id);
    if (!record) throw new NotFoundError('FinanceCalculation', id);
    return record;
  },

  ai: aiReadinessService,
};

function buildRecord(
  kind: Prisma.FinanceCalculationCreateInput['calculationKind'],
  input: unknown,
  output: unknown,
  ctx: RequestContext,
  cacheKey: string | null,
  refs: {
    productSlug?: Prisma.FinanceCalculationCreateInput['productSlug'];
    productId?: string | null;
    variantId?: string | null;
    customerId?: string;
    leadId?: string;
    applicationId?: string;
  },
): Prisma.FinanceCalculationCreateInput {
  return {
    calculationKind: kind,
    productSlug: refs.productSlug,
    product: refs.productId ? { connect: { id: refs.productId } } : undefined,
    variant: refs.variantId ? { connect: { id: refs.variantId } } : undefined,
    customer: refs.customerId ? { connect: { id: refs.customerId } } : undefined,
    lead: refs.leadId ? { connect: { id: refs.leadId } } : undefined,
    application: refs.applicationId ? { connect: { id: refs.applicationId } } : undefined,
    cacheKey: cacheKey ?? undefined,
    inputPayload: input as Prisma.InputJsonValue,
    outputPayload: output as Prisma.InputJsonValue,
    engineVersion: FINANCE_ENGINE_VERSION,
    computedBy: { connect: { id: ctx.actorId } },
    ipAddress: ctx.ipAddress,
    requestId: ctx.requestId,
  };
}
