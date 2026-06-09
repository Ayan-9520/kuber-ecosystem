import type { Prisma } from '@kuberone/database';
import type {
  ApplicantProfile,
  EvaluateEligibilityResultInput,
  ListEligibilityResultsQuery,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { lenderRepository } from '../../product/repositories/lender.repository.js';
import { eligibilityRuleService } from '../../product/services/eligibility-rule.service.js';
import { ELIGIBILITY_ENGINE_VERSION } from '../constants/applications.constants.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { eligibilityResultRepository } from '../repositories/eligibility-result.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation, buildPaginationMeta } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';

export const eligibilityResultService = {
  async list(query: ListEligibilityResultsQuery) {
    const where: Prisma.EligibilityResultWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.result ? { result: query.result as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      eligibilityResultRepository.list(where, skip, query.limit, orderBy),
      eligibilityResultRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const result = await eligibilityResultRepository.findById(id);
    if (!result) throw new NotFoundError('EligibilityResult', id);
    return result;
  },

  async evaluate(input: EvaluateEligibilityResultInput, ctx: RequestContext, profile?: ApplicantProfile) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw new NotFoundError('Application', input.applicationId);

    const applicant = profile ?? input.applicantProfile ?? {
      requestedLoanAmount: Number(application.requestedAmount),
    };

    const evaluation = await eligibilityRuleService.evaluate({
      productId: application.productId,
      variantId: application.variantId ?? undefined,
      applicant: {
        ...applicant,
        requestedLoanAmount: applicant.requestedLoanAmount ?? Number(application.requestedAmount),
      },
    });

    const lenders = await lenderRepository.list(
      { isActive: true, policies: { some: { productId: application.productId, isActive: true } } },
      0,
      5,
      { name: 'asc' },
    );

    const now = new Date();
    const record = await eligibilityResultRepository.create({
      applicationId: application.id,
      customerId: application.customerId,
      productId: application.productId,
      result: evaluation.outcome as never,
      eligibleAmount: evaluation.maximumLoanAmount,
      foir: computeFoir(applicant),
      ltv: computeLtv(applicant),
      dscr: null,
      approvalProbability: evaluation.approvalProbability * 100,
      riskFlags: evaluation.riskFlags as Prisma.InputJsonValue,
      recommendedLenders: lenders.map((l) => ({ id: l.id, code: l.code, name: l.name })) as Prisma.InputJsonValue,
      ruleResults: evaluation as unknown as Prisma.InputJsonValue,
      engineVersion: ELIGIBILITY_ENGINE_VERSION,
      checkedAt: now,
      checkedById: ctx.actorId,
    });

    await applicationTimelineService.addEvent(
      application.id,
      'CREDIT_REVIEW',
      `Eligibility: ${evaluation.outcome}`,
      ctx,
      `Eligible amount: ${evaluation.maximumLoanAmount ?? 'N/A'}`,
      { approvalProbability: evaluation.approvalProbability },
    );

    await auditApplicationMutation(
      authAuditRepository.log,
      ctx,
      'ELIGIBILITY_EVALUATED',
      'application',
      application.id,
      { result: evaluation.outcome },
    );

    return record;
  },

  async getLatest(applicationId: string) {
    return eligibilityResultRepository.findLatestByApplicationId(applicationId);
  },
};

function computeFoir(profile: ApplicantProfile): number | null {
  const income = profile.monthlyIncome ?? (profile.annualIncome ? profile.annualIncome / 12 : undefined);
  if (!income || !profile.existingEmi) return null;
  return Math.round(((profile.existingEmi / income) * 100) * 100) / 100;
}

function computeLtv(profile: ApplicantProfile): number | null {
  if (!profile.propertyValue || !profile.requestedLoanAmount) return null;
  return Math.round(((profile.requestedLoanAmount / profile.propertyValue) * 100) * 100) / 100;
}
