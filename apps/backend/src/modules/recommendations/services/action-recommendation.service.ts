import { nextBestActionService } from '../../ai-copilot/services/copilot-engines.service.js';
import { RECOMMENDATION_MODEL_VERSION } from '../constants/recommendations.constants.js';
import type { ActionResult, CustomerProfile } from '../types/recommendations.types.js';

export const actionRecommendationService = {
  forLead(profile: CustomerProfile, openDeficiencies = 0): ActionResult[] {
    return nextBestActionService
      .forLead({
        leadStatus: profile.applicationStatus,
        openDeficiencies,
        approvalProbability: profile.leadScore,
        daysSinceLastActivity: 2,
      })
      .map((a) => ({
        actionType: a.actionType,
        title: a.title,
        description: a.description,
        priority: a.priority,
        dueAt: a.dueAt,
      }));
  },

  forApplication(profile: CustomerProfile, ctx: { deficiencies?: number; bankLoginPending?: boolean; creditReviewPending?: boolean }): ActionResult[] {
    return nextBestActionService
      .forApplication({
        applicationStatus: profile.applicationStatus,
        openDeficiencies: ctx.deficiencies ?? 0,
        bankLoginPending: ctx.bankLoginPending,
        creditReviewPending: ctx.creditReviewPending,
        approvalProbability: profile.leadScore,
      })
      .map((a) => ({
        actionType: a.actionType,
        title: a.title,
        description: a.description,
        priority: a.priority,
      }));
  },

  modelVersion: RECOMMENDATION_MODEL_VERSION,
};
