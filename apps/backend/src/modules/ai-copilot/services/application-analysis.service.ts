import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { applicationService } from '../../applications/services/application.service.js';
import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { COPILOT_MODEL_VERSION, COPILOT_PROVIDER } from '../constants/ai-copilot.constants.js';
import { copilotRepository } from '../repositories/copilot.repository.js';
import type { CopilotApplicationAnalysis, CopilotRiskFlag, RequestContext } from '../types/ai-copilot.types.js';

import { crossSellService, nextBestActionService } from './copilot-engines.service.js';

const DELAY_STATUSES = ['SUBMITTED', 'DOCUMENTATION', 'BANK_LOGIN', 'CREDIT_REVIEW', 'SANCTIONED'];

export const applicationAnalysisService = {
  async analyze(
    actor: AuthenticatedUser,
    applicationId: string,
    ctx: RequestContext,
  ): Promise<CopilotApplicationAnalysis> {
    const app = await applicationService.getById(actor, applicationId);

    const [deficiencies, bankLogins, creditReviews, sanction, disbursements, eligibility] = await Promise.all([
      prisma.documentDeficiency.count({ where: { applicationId, status: 'OPEN' } }),
      prisma.bankLogin.count({ where: { applicationId, status: { in: ['PENDING', 'SUBMITTED', 'QUERY_RAISED'] } } }),
      prisma.creditReview.count({ where: { applicationId, decision: { in: ['PENDING', 'QUERY'] } } }),
      prisma.sanction.findFirst({ where: { applicationId } }),
      prisma.disbursement.count({ where: { applicationId, status: 'COMPLETED' } }),
      prisma.eligibilityResult.findFirst({ where: { applicationId }, orderBy: { createdAt: 'desc' } }),
    ]);

    let approvalProbability = Number(eligibility?.approvalProbability ?? 65);
    try {
      const customer = await prisma.customer.findFirst({
        where: { id: app.customerId },
        include: { incomes: true, employments: true },
      });
      const monthlyIncome = Number(customer?.incomes?.[0]?.grossAmount ?? customer?.incomes?.[0]?.netAmount ?? 0) || undefined;
      const appMetadata = (app.metadata ?? {}) as Record<string, unknown>;
      const creditScore = Number(appMetadata.creditScore ?? 0) || undefined;
      const result = (await financeEngineService.calculateEligibility(
        {
          monthlyIncome,
          creditScore,
          requestedLoanAmount: Number(app.requestedAmount),
          requestedTenureMonths: app.requestedTenureMonths,
          productId: app.productId,
          applicationId,
          customerId: app.customerId,
          existingObligations: 0,
          persist: false,
          useCache: true,
        },
        ctx,
      )) as Record<string, unknown>;
      approvalProbability = Number(result.approvalProbability ?? approvalProbability);
    } catch {
      /* use default */
    }

    const statusDelayFactor = DELAY_STATUSES.includes(app.status) ? 15 : 0;
    const deficiencyFactor = deficiencies * 8;
    const bankLoginFactor = bankLogins > 0 ? 12 : 0;
    const creditFactor = creditReviews > 0 ? 10 : 0;
    const delayRisk = Math.min(95, statusDelayFactor + deficiencyFactor + bankLoginFactor + creditFactor);

    const successProbability = Math.max(5, approvalProbability - Math.round(delayRisk * 0.4));
    const disbursalProbability =
      app.status === 'DISBURSED' ? 100 : sanction ? Math.round(successProbability * 0.9) : Math.round(successProbability * 0.7);

    const missingInformation: string[] = [];
    if (deficiencies > 0) missingInformation.push(`${deficiencies} document deficiencies pending`);
    if (bankLogins > 0) missingInformation.push('Bank login not completed');
    if (creditReviews > 0) missingInformation.push('Credit review in progress');
    if (!sanction && ['CREDIT_REVIEW', 'SANCTIONED'].includes(app.status)) {
      missingInformation.push('Sanction letter not recorded');
    }
    if (sanction && disbursements === 0 && app.status === 'SANCTIONED') {
      missingInformation.push('Disbursement not initiated');
    }

    const escalationRequired = delayRisk >= 40 || deficiencies >= 3;

    const riskFlags: CopilotRiskFlag[] = [];
    if (deficiencies > 0) {
      riskFlags.push({
        code: 'DOC_DEFICIENCY',
        label: 'Document deficiencies',
        severity: deficiencies >= 3 ? 'CRITICAL' : 'HIGH',
        description: `${deficiencies} open deficiencies`,
      });
    }
    if (delayRisk >= 40) {
      riskFlags.push({
        code: 'DELAY_RISK',
        label: 'Processing delay risk',
        severity: delayRisk >= 60 ? 'HIGH' : 'MEDIUM',
        description: `Delay risk score: ${delayRisk}%`,
      });
    }
    if (bankLogins > 0) {
      riskFlags.push({
        code: 'BANK_LOGIN_PENDING',
        label: 'Bank login pending',
        severity: 'MEDIUM',
      });
    }

    const nextBestActions = nextBestActionService.forApplication({
      applicationStatus: app.status,
      openDeficiencies: deficiencies,
      bankLoginPending: bankLogins > 0,
      creditReviewPending: creditReviews > 0,
      sanctionPending: !sanction && app.status === 'CREDIT_REVIEW',
      disbursalPending: !!sanction && disbursements === 0,
      approvalProbability,
      slaBreached: delayRisk >= 50,
    });

    const crossSellOpportunities = crossSellService.detect({
      approvalProbability,
      hasExistingLoan: app.status === 'DISBURSED',
    });

    const insights = [
      {
        category: 'APPLICATION' as const,
        title: 'Application pipeline status',
        summary: `Application ${app.applicationNumber} is in ${app.status.replace(/_/g, ' ')} stage.`,
        confidence: successProbability,
        details: { status: app.status, requestedAmount: app.requestedAmount },
      },
      {
        category: 'RISK' as const,
        title: 'Delay & escalation outlook',
        summary: escalationRequired
          ? 'Escalation recommended due to delay risk or missing information.'
          : 'Application progressing within acceptable timelines.',
        confidence: 100 - delayRisk,
      },
    ];

    const session = await copilotRepository.createSession({
      userId: actor.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      branchId: app.branchId ?? undefined,
      regionId: app.regionId ?? undefined,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
      contextPayload: { applicationNumber: app.applicationNumber, status: app.status },
    });

    for (const insight of insights) {
      await copilotRepository.createInsight({
        session: { connect: { id: session.id } },
        userId: actor.id,
        entityType: 'APPLICATION',
        entityId: applicationId,
        category: insight.category,
        title: insight.title,
        summary: insight.summary,
        details: insight.details as never,
        confidence: insight.confidence,
        modelVersion: COPILOT_MODEL_VERSION,
        provider: COPILOT_PROVIDER,
      });
    }

    for (const flag of riskFlags) {
      await copilotRepository.createRiskFlag({
        session: { connect: { id: session.id } },
        userId: actor.id,
        entityType: 'APPLICATION',
        entityId: applicationId,
        code: flag.code,
        label: flag.label,
        severity: flag.severity,
        description: flag.description,
      });
    }

    for (const action of nextBestActions) {
      await copilotRepository.createActionSuggestion({
        session: { connect: { id: session.id } },
        userId: actor.id,
        entityType: 'APPLICATION',
        entityId: applicationId,
        actionType: action.actionType,
        title: action.title,
        description: action.description,
        priority: action.priority,
      });
    }

    await copilotRepository.createPrediction({
      session: { connect: { id: session.id } },
      userId: actor.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      predictionType: 'SUCCESS',
      probability: successProbability,
      modelVersion: COPILOT_MODEL_VERSION,
    });

    await copilotRepository.createPrediction({
      session: { connect: { id: session.id } },
      userId: actor.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      predictionType: 'DELAY',
      probability: delayRisk,
      modelVersion: COPILOT_MODEL_VERSION,
    });

    await copilotRepository.createPrediction({
      session: { connect: { id: session.id } },
      userId: actor.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      predictionType: 'APPROVAL',
      probability: approvalProbability,
      modelVersion: COPILOT_MODEL_VERSION,
    });

    await copilotRepository.createPrediction({
      session: { connect: { id: session.id } },
      userId: actor.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      predictionType: 'DISBURSAL',
      probability: disbursalProbability,
      modelVersion: COPILOT_MODEL_VERSION,
    });

    return {
      applicationId,
      successProbability,
      delayRisk,
      approvalProbability,
      disbursalProbability,
      missingInformation,
      escalationRequired,
      riskFlags,
      nextBestActions,
      crossSellOpportunities,
      insights,
      sessionId: session.id,
    };
  },
};
