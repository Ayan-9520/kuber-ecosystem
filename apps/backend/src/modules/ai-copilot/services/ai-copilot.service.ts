import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { applyLeadScope, applyApplicationScope } from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerService } from '../../customers/services/customer.service.js';
import { leadAnalyticsService } from '../../leads/services/lead-analytics.service.js';
import { recommendationOrchestratorService } from '../../recommendations/recommendations.module.js';
import { COPILOT_ACTIONS, COPILOT_AUDIT_ENTITY } from '../constants/ai-copilot.constants.js';
import { copilotRepository } from '../repositories/copilot.repository.js';
import type {
  CopilotAnalyticsSummary,
  CopilotEntitySummary,
  RequestContext,
} from '../types/ai-copilot.types.js';
import type {
  CopilotAnalyticsQuery,
  CopilotFeedbackInput,
  CopilotInsightsQuery,
  CopilotRecommendationsQuery,
} from '../validators/ai-copilot.validator.js';

import { applicationAnalysisService } from './application-analysis.service.js';
import { leadAnalysisService } from './lead-analysis.service.js';

export const aiCopilotService = {
  async analyzeLead(actor: AuthenticatedUser, leadId: string, ctx: RequestContext) {
    const result = await leadAnalysisService.analyze(actor, leadId, ctx);
    await authAuditRepository.log({
      userId: actor.id,
      action: COPILOT_ACTIONS.LEAD_ANALYZED,
      entityType: COPILOT_AUDIT_ENTITY,
      entityId: result.sessionId,
      newValues: { leadId, leadGrade: result.leadGrade, approvalProbability: result.approvalProbability } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
    return result;
  },

  async analyzeApplication(actor: AuthenticatedUser, applicationId: string, ctx: RequestContext) {
    const result = await applicationAnalysisService.analyze(actor, applicationId, ctx);
    await authAuditRepository.log({
      userId: actor.id,
      action: COPILOT_ACTIONS.APPLICATION_ANALYZED,
      entityType: COPILOT_AUDIT_ENTITY,
      entityId: result.sessionId,
      newValues: { applicationId, successProbability: result.successProbability, delayRisk: result.delayRisk } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
    return result;
  },

  async analyzeCustomer(actor: AuthenticatedUser, customerId: string, ctx: RequestContext): Promise<CopilotEntitySummary> {
    const customer = await customerService.getById(actor, customerId);

    const apps = await prisma.application.findMany({
      where: applyApplicationScope(actor, { customerId, deletedAt: null }),
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const leads = await prisma.lead.findMany({
      where: applyLeadScope(actor, { customerId, deletedAt: null }),
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const bundle = await recommendationOrchestratorService.forCustomer(actor, customerId, ctx);

    const session = await copilotRepository.createSession({
      userId: actor.id,
      entityType: 'CUSTOMER',
      entityId: customerId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    const insights = [
      {
        category: 'LEAD' as const,
        title: 'Customer portfolio',
        summary: `${leads.length} active lead(s) and ${apps.length} application(s) on file.`,
        confidence: 80,
      },
      {
        category: 'PRODUCT' as const,
        title: 'Top product recommendation',
        summary: bundle.products[0]?.reason ?? 'Run full analysis for product fit.',
        confidence: bundle.products[0]?.approvalProbability ?? 70,
      },
    ];

    for (const insight of insights) {
      await copilotRepository.createInsight({
        session: { connect: { id: session.id } },
        userId: actor.id,
        entityType: 'CUSTOMER',
        entityId: customerId,
        category: insight.category,
        title: insight.title,
        summary: insight.summary,
        confidence: insight.confidence,
      });
    }

    return {
      entityType: 'CUSTOMER',
      entityId: customerId,
      title: String(customer.fullName ?? customer.id),
      insights,
      recommendations: bundle.products.map((p) => ({ type: 'PRODUCT' as const, title: p.productName, description: p.reason, priority: p.rankScore })),
      predictions: [{ type: 'APPROVAL', probability: bundle.approvalProbability }],
      riskFlags: bundle.risk.explanations.map((e) => ({ code: 'RISK', label: e, severity: bundle.risk.riskLevel })),
      nextBestActions: bundle.actions.map((a) => ({ actionType: a.actionType as never, title: a.title, description: a.description, priority: a.priority })),
      crossSellOpportunities: bundle.crossSell.map((c) => ({ code: c.productCode, label: c.label, description: c.description, score: c.matchScore })),
      sessionId: session.id,
    };
  },

  async analyzeExecutive(actor: AuthenticatedUser, executiveId: string, ctx: RequestContext): Promise<CopilotEntitySummary> {
    const employee = await prisma.employee.findFirst({
      where: { id: executiveId, deletedAt: null },
    });
    if (!employee) throw new NotFoundError('Employee', executiveId);

    const [assignedLeads, convertedLeads, openApps] = await Promise.all([
      prisma.lead.count({ where: { assignedToId: executiveId, deletedAt: null } }),
      prisma.lead.count({
        where: {
          assignedToId: executiveId,
          status: { in: ['APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED', 'QUALIFIED'] },
          deletedAt: null,
        },
      }),
      prisma.application.count({
        where: { assignedSalesId: executiveId, status: { notIn: ['DISBURSED', 'CLOSED', 'REJECTED'] }, deletedAt: null },
      }),
    ]);

    const conversionRate = assignedLeads > 0 ? Math.round((convertedLeads / assignedLeads) * 100) : 0;

    const session = await copilotRepository.createSession({
      userId: actor.id,
      entityType: 'EXECUTIVE',
      entityId: executiveId,
      branchId: employee.branchId ?? undefined,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    const insights = [
      {
        category: 'EXECUTIVE' as const,
        title: 'Executive performance snapshot',
        summary: `${assignedLeads} leads assigned, ${conversionRate}% conversion, ${openApps} open applications.`,
        confidence: conversionRate,
        details: { assignedLeads, convertedLeads, openApps },
      },
    ];

    for (const insight of insights) {
      await copilotRepository.createInsight({
        session: { connect: { id: session.id } },
        userId: actor.id,
        entityType: 'EXECUTIVE',
        entityId: executiveId,
        category: insight.category,
        title: insight.title,
        summary: insight.summary,
        confidence: insight.confidence,
        details: insight.details as never,
      });
    }

    await copilotRepository.createPrediction({
      session: { connect: { id: session.id } },
      userId: actor.id,
      entityType: 'EXECUTIVE',
      entityId: executiveId,
      predictionType: 'CONVERSION',
      probability: conversionRate,
    });

    return {
      entityType: 'EXECUTIVE',
      entityId: executiveId,
      title: `${employee.firstName} ${employee.lastName}`,
      insights,
      recommendations: [],
      predictions: [{ type: 'CONVERSION', probability: conversionRate }],
      riskFlags: conversionRate < 20 ? [{ code: 'LOW_CONVERSION', label: 'Low conversion rate', severity: 'MEDIUM' }] : [],
      nextBestActions: [],
      crossSellOpportunities: [],
      sessionId: session.id,
    };
  },

  async analyzeBranch(actor: AuthenticatedUser, branchId: string, ctx: RequestContext): Promise<CopilotEntitySummary> {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, isActive: true } });
    if (!branch) throw new NotFoundError('Branch', branchId);

    const analytics = await leadAnalyticsService.getSummary({ branchId });

    const session = await copilotRepository.createSession({
      userId: actor.id,
      entityType: 'BRANCH',
      entityId: branchId,
      branchId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    const conversionRate =
      analytics.convertedLeads > 0 && analytics.todayLeads + analytics.qualifiedLeads > 0
        ? Math.round((analytics.convertedLeads / (analytics.convertedLeads + analytics.lostLeads + 1)) * 100)
        : 0;

    const insights = [
      {
        category: 'BRANCH' as const,
        title: 'Branch pipeline health',
        summary: `${analytics.qualifiedLeads} qualified, ${analytics.hotLeads} hot leads, ${analytics.convertedLeads} converted.`,
        confidence: 85,
        details: analytics as unknown as Record<string, unknown>,
      },
      {
        category: 'MANAGEMENT' as const,
        title: 'Branch conversion outlook',
        summary: `Estimated branch conversion rate: ${conversionRate}%.`,
        confidence: conversionRate,
      },
    ];

    for (const insight of insights) {
      await copilotRepository.createInsight({
        session: { connect: { id: session.id } },
        userId: actor.id,
        entityType: 'BRANCH',
        entityId: branchId,
        category: insight.category,
        title: insight.title,
        summary: insight.summary,
        confidence: insight.confidence,
        details: insight.details as never,
      });
    }

    return {
      entityType: 'BRANCH',
      entityId: branchId,
      title: branch.name,
      insights,
      recommendations: [],
      predictions: [{ type: 'CONVERSION', probability: conversionRate }],
      riskFlags: [],
      nextBestActions: [],
      crossSellOpportunities: [],
      sessionId: session.id,
    };
  },

  listInsights(actor: AuthenticatedUser, query: CopilotInsightsQuery) {
    return copilotRepository.listInsights({
      userId: actor.id,
      entityType: query.entityType,
      entityId: query.entityId,
      category: query.category,
      limit: query.limit,
    });
  },

  listRecommendations(actor: AuthenticatedUser, query: CopilotRecommendationsQuery) {
    return copilotRepository.listRecommendations({
      userId: actor.id,
      entityType: query.entityType,
      entityId: query.entityId,
      recommendationType: query.recommendationType,
      limit: query.limit,
    });
  },

  async submitFeedback(actor: AuthenticatedUser, input: CopilotFeedbackInput, ctx: RequestContext) {
    const feedback = await copilotRepository.createFeedback({
      userId: actor.id,
      rating: input.rating,
      comment: input.comment,
      entityType: input.entityType,
      entityId: input.entityId,
      insightId: input.insightId,
      recommendationId: input.recommendationId,
      ...(input.sessionId ? { session: { connect: { id: input.sessionId } } } : {}),
    });

    await authAuditRepository.log({
      userId: actor.id,
      action: COPILOT_ACTIONS.FEEDBACK_SUBMITTED,
      entityType: COPILOT_AUDIT_ENTITY,
      entityId: feedback.id,
      newValues: { rating: input.rating, entityType: input.entityType } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return feedback;
  },

  async getAnalytics(actor: AuthenticatedUser, query: CopilotAnalyticsQuery): Promise<CopilotAnalyticsSummary> {
    const dateFilter = {
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
    };

    const [totalSessions, totalInsights, totalRecs, acceptedRecs, totalPreds, accuratePreds, byEntity] =
      await Promise.all([
        copilotRepository.countSessions(dateFilter),
        prisma.aiInsight.count({ where: { userId: actor.id, ...dateFilter } }),
        copilotRepository.countRecommendations({ userId: actor.id, ...dateFilter }),
        copilotRepository.countAcceptedRecommendations({ userId: actor.id, ...dateFilter }),
        copilotRepository.countPredictions({ userId: actor.id, ...dateFilter }),
        copilotRepository.countAccuratePredictions({ userId: actor.id, ...dateFilter }),
        copilotRepository.groupSessionsByEntity(dateFilter),
      ]);

    const approvalPreds = await copilotRepository.countPredictions({
      userId: actor.id,
      predictionType: 'APPROVAL',
      ...dateFilter,
    });
    const approvalAccurate = await copilotRepository.countAccuratePredictions({
      userId: actor.id,
      predictionType: 'APPROVAL',
      ...dateFilter,
    });
    const disbursalPreds = await copilotRepository.countPredictions({
      userId: actor.id,
      predictionType: 'DISBURSAL',
      ...dateFilter,
    });
    const disbursalAccurate = await copilotRepository.countAccuratePredictions({
      userId: actor.id,
      predictionType: 'DISBURSAL',
      ...dateFilter,
    });
    const conversionPreds = await copilotRepository.countPredictions({
      userId: actor.id,
      predictionType: 'CONVERSION',
      ...dateFilter,
    });

    const usageByEntityType: Record<string, number> = {};
    for (const row of byEntity) {
      usageByEntityType[row.entityType] = row._count.id;
    }

    return {
      totalSessions,
      totalInsights,
      totalRecommendations: totalRecs,
      recommendationAcceptanceRate: totalRecs > 0 ? Math.round((acceptedRecs / totalRecs) * 100) : 0,
      predictionAccuracyRate: totalPreds > 0 ? Math.round((accuratePreds / totalPreds) * 100) : 0,
      approvalAccuracyRate: approvalPreds > 0 ? Math.round((approvalAccurate / approvalPreds) * 100) : 0,
      disbursalAccuracyRate: disbursalPreds > 0 ? Math.round((disbursalAccurate / disbursalPreds) * 100) : 0,
      conversionRate: conversionPreds > 0 ? Math.round(conversionPreds / Math.max(totalSessions, 1)) : 0,
      usageByEntityType,
    };
  },
};
