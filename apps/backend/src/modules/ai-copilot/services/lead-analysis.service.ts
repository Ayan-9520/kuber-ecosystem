import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { completionService } from '../../ai-platform/services/completion.service.js';
import { leadScoringService } from '../../lead-scoring/lead-scoring.module.js';
import { leadService } from '../../leads/services/lead.service.js';
import { ragContextService } from '../../rag/rag.module.js';
import { recommendationOrchestratorService } from '../../recommendations/recommendations.module.js';
import { COPILOT_MODEL_VERSION, COPILOT_PROVIDER } from '../constants/ai-copilot.constants.js';
import { copilotRepository } from '../repositories/copilot.repository.js';
import type {
  CopilotLeadAnalysis,
  CopilotRiskFlag,
  RequestContext,
} from '../types/ai-copilot.types.js';

function mapSeverity(indicator: string): CopilotRiskFlag['severity'] {
  if (indicator.toLowerCase().includes('critical') || indicator.toLowerCase().includes('cibil')) {
    return 'HIGH';
  }
  if (indicator.toLowerCase().includes('low') || indicator.toLowerCase().includes('high loan')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

export const leadAnalysisService = {
  async analyze(actor: AuthenticatedUser, leadId: string, ctx: RequestContext): Promise<CopilotLeadAnalysis> {
    const lead = await leadService.getById(actor, leadId);

    const scoreResult = await leadScoringService.calculate(actor, leadId, ctx, { force: false });

    const recBundle = await recommendationOrchestratorService.forLead(actor, leadId, {
      actorId: actor.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    const ragContext = await ragContextService.getSnippetStrings(
      `lead ${lead.leadNumber} ${lead.product?.name ?? ''} loan eligibility documents lender policy`,
      { topK: 5, source: 'COPILOT' },
      actor.id,
    ).catch(() => [] as string[]);

    const approvalProbability = scoreResult.approvalProbability;
    const disbursalProbability = scoreResult.disbursalProbability;
    const conversionProbability = scoreResult.conversionProbability;
    const scoring = {
      grade: scoreResult.grade,
      score: scoreResult.score,
      approvalProbability,
      riskIndicators: (scoreResult.riskIndicators as string[]) ?? [],
    };

    const deficiencies = await prisma.documentDeficiency.count({
      where: { leadId, status: 'OPEN' },
    });

    const riskFlags: CopilotRiskFlag[] = scoring.riskIndicators.map((label) => ({
      code: label.toUpperCase().replace(/\s+/g, '_').slice(0, 50),
      label,
      severity: mapSeverity(label),
      description: label,
    }));

    if (deficiencies > 0) {
      riskFlags.push({
        code: 'MISSING_DOCUMENTS',
        label: 'Missing documents',
        severity: 'HIGH',
        description: `${deficiencies} open document deficiencies`,
      });
    }

    for (const explanation of recBundle.risk.explanations) {
      riskFlags.push({
        code: explanation.toUpperCase().replace(/\s+/g, '_').slice(0, 50),
        label: explanation,
        severity: recBundle.risk.riskLevel === 'CRITICAL' || recBundle.risk.riskLevel === 'HIGH' ? 'HIGH' : mapSeverity(explanation),
        description: explanation,
      });
    }

    if (ragContext.length > 0) {
      riskFlags.push({
        code: 'RAG_POLICY_CONTEXT',
        label: 'Knowledge base policy context',
        severity: 'LOW',
        description: ragContext[0]!.slice(0, 200),
      });
    }

    const recommendedProduct = recBundle.products[0]
      ? {
          type: 'PRODUCT' as const,
          title: recBundle.products[0].productName,
          description: recBundle.products[0].reason,
          payload: recBundle.products[0] as unknown as Record<string, unknown>,
          priority: recBundle.products[0].rankScore,
        }
      : null;

    const recommendedLender = recBundle.lenders[0]
      ? {
          type: 'LENDER' as const,
          title: recBundle.lenders[0].lenderName,
          description: recBundle.lenders[0].reason,
          payload: recBundle.lenders[0] as unknown as Record<string, unknown>,
          priority: recBundle.lenders[0].rankScore,
        }
      : null;

    let recommendedExecutive = null;
    if (lead.branchId) {
      const executives = await prisma.employee.findMany({
        where: { branchId: lead.branchId, isActive: true, deletedAt: null },
        take: 3,
        orderBy: { createdAt: 'asc' },
      });
      const exec = executives[0];
      if (exec) {
        recommendedExecutive = {
          type: 'EXECUTIVE' as const,
          title: `${exec.firstName} ${exec.lastName}`,
          description: 'Recommended based on branch assignment load',
          payload: { employeeId: exec.id, branchId: lead.branchId },
          priority: 70,
        };
      }
    }

    const nextBestActions = recBundle.actions.map((a) => ({
      actionType: a.actionType as never,
      title: a.title,
      description: a.description,
      priority: a.priority,
      dueAt: a.dueAt,
    }));

    const crossSellOpportunities = recBundle.crossSell.map((c) => ({
      code: c.productCode,
      label: c.label,
      description: c.description,
      score: c.matchScore,
    }));

    const insights = [
      {
        category: 'LEAD' as const,
        title: 'Lead qualification summary',
        summary: `Lead ${lead.leadNumber} graded ${scoring.grade} with ${approvalProbability}% approval probability.`,
        confidence: approvalProbability,
        details: { score: scoring.score, grade: scoring.grade, status: lead.status },
      },
      {
        category: 'CONVERSION' as const,
        title: 'Conversion outlook',
        summary: `Estimated conversion probability: ${conversionProbability}%. Disbursal probability: ${disbursalProbability}%.`,
        confidence: conversionProbability,
      },
    ];

    if (completionService.isAvailable()) {
      try {
        const llm = await completionService.chat(
          {
            module: 'COPILOT',
            messages: [
              {
                role: 'system',
                content: 'You are the AI Sales Copilot for Kuber Finserve. Provide one concise actionable insight for the relationship manager.',
              },
              {
                role: 'user',
                content: `Lead ${lead.leadNumber}, grade ${scoring.grade}, approval ${approvalProbability}%, risk ${recBundle.risk.riskLevel}. Policies: ${ragContext.slice(0, 2).join(' | ')}`,
              },
            ],
          },
          { actorId: actor.id, ipAddress: ctx.ipAddress, requestId: ctx.requestId },
        );
        insights.push({
          category: 'LEAD' as const,
          title: 'AI-generated insight',
          summary: llm.content,
          confidence: Math.min(95, approvalProbability + 5),
          details: { score: scoring.score, grade: scoring.grade, status: lead.status },
        });
      } catch {
        /* rules-engine insights remain */
      }
    }

    const session = await copilotRepository.createSession({
      userId: actor.id,
      entityType: 'LEAD',
      entityId: leadId,
      branchId: lead.branchId ?? undefined,
      regionId: lead.regionId ?? undefined,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
      contextPayload: { leadNumber: lead.leadNumber, status: lead.status },
    });

    await persistLeadAnalysis(actor.id, session.id, leadId, {
      insights,
      riskFlags,
      recommendedProduct,
      recommendedLender,
      recommendedExecutive,
      nextBestActions,
      crossSellOpportunities,
      approvalProbability,
      disbursalProbability,
      conversionProbability,
      grade: scoring.grade,
    });

    return {
      leadId,
      leadGrade: scoring.grade,
      approvalProbability,
      disbursalProbability,
      conversionProbability,
      riskRating: scoreResult.riskRating,
      priorityLevel: scoreResult.priorityLevel,
      classification: scoreResult.classification,
      riskFlags,
      recommendedProduct,
      recommendedLender,
      recommendedExecutive,
      nextBestActions,
      crossSellOpportunities,
      insights,
      sessionId: session.id,
    };
  },
};

async function persistLeadAnalysis(
  userId: string,
  sessionId: string,
  leadId: string,
  data: {
    insights: CopilotLeadAnalysis['insights'];
    riskFlags: CopilotRiskFlag[];
    recommendedProduct: CopilotLeadAnalysis['recommendedProduct'];
    recommendedLender: CopilotLeadAnalysis['recommendedLender'];
    recommendedExecutive: CopilotLeadAnalysis['recommendedExecutive'];
    nextBestActions: CopilotLeadAnalysis['nextBestActions'];
    crossSellOpportunities: CopilotLeadAnalysis['crossSellOpportunities'];
    approvalProbability: number;
    disbursalProbability: number;
    conversionProbability: number;
    grade: string;
  },
) {
  for (const insight of data.insights) {
    await copilotRepository.createInsight({
      session: { connect: { id: sessionId } },
      userId,
      entityType: 'LEAD',
      entityId: leadId,
      category: insight.category,
      title: insight.title,
      summary: insight.summary,
      details: insight.details as never,
      confidence: insight.confidence,
      modelVersion: COPILOT_MODEL_VERSION,
      provider: COPILOT_PROVIDER,
    });
  }

  for (const flag of data.riskFlags) {
    await copilotRepository.createRiskFlag({
      session: { connect: { id: sessionId } },
      userId,
      entityType: 'LEAD',
      entityId: leadId,
      code: flag.code,
      label: flag.label,
      severity: flag.severity,
      description: flag.description,
    });
  }

  const recs = [data.recommendedProduct, data.recommendedLender, data.recommendedExecutive].filter(Boolean);
  for (const rec of recs) {
    if (!rec) continue;
    await copilotRepository.createRecommendation({
      session: { connect: { id: sessionId } },
      userId,
      entityType: 'LEAD',
      entityId: leadId,
      recommendationType: rec.type,
      title: rec.title,
      description: rec.description,
      payload: rec.payload as never,
      priority: rec.priority,
      modelVersion: COPILOT_MODEL_VERSION,
    });
  }

  for (const action of data.nextBestActions) {
    await copilotRepository.createActionSuggestion({
      session: { connect: { id: sessionId } },
      userId,
      entityType: 'LEAD',
      entityId: leadId,
      actionType: action.actionType,
      title: action.title,
      description: action.description,
      priority: action.priority,
      dueAt: action.dueAt ? new Date(action.dueAt) : undefined,
    });
  }

  await copilotRepository.createPrediction({
    session: { connect: { id: sessionId } },
    userId,
    entityType: 'LEAD',
    entityId: leadId,
    predictionType: 'APPROVAL',
    probability: data.approvalProbability,
    grade: data.grade,
    modelVersion: COPILOT_MODEL_VERSION,
  });

  await copilotRepository.createPrediction({
    session: { connect: { id: sessionId } },
    userId,
    entityType: 'LEAD',
    entityId: leadId,
    predictionType: 'DISBURSAL',
    probability: data.disbursalProbability,
    modelVersion: COPILOT_MODEL_VERSION,
  });

  await copilotRepository.createPrediction({
    session: { connect: { id: sessionId } },
    userId,
    entityType: 'LEAD',
    entityId: leadId,
    predictionType: 'CONVERSION',
    probability: data.conversionProbability,
    modelVersion: COPILOT_MODEL_VERSION,
  });

  for (const cs of data.crossSellOpportunities) {
    await copilotRepository.createRecommendation({
      session: { connect: { id: sessionId } },
      userId,
      entityType: 'LEAD',
      entityId: leadId,
      recommendationType: 'CROSS_SELL',
      title: cs.label,
      description: cs.description,
      payload: { code: cs.code, score: cs.score } as never,
      priority: cs.score,
      modelVersion: COPILOT_MODEL_VERSION,
    });
  }
}

export type { CopilotLeadAnalysis };
