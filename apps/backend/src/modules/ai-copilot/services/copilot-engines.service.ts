import { CROSS_SELL_PRODUCTS } from '../constants/ai-copilot.constants.js';
import type { CopilotAction, CopilotCrossSell } from '../types/ai-copilot.types.js';

interface NbaContext {
  leadStatus?: string;
  applicationStatus?: string;
  openDeficiencies?: number;
  bankLoginPending?: boolean;
  creditReviewPending?: boolean;
  sanctionPending?: boolean;
  disbursalPending?: boolean;
  slaBreached?: boolean;
  approvalProbability?: number;
  daysSinceLastActivity?: number;
  hasConvertedLead?: boolean;
}

export const nextBestActionService = {
  forLead(ctx: NbaContext): CopilotAction[] {
    const actions: CopilotAction[] = [];

    if (ctx.openDeficiencies && ctx.openDeficiencies > 0) {
      actions.push({
        actionType: 'COLLECT_DOCUMENTS',
        title: 'Collect missing documents',
        description: `${ctx.openDeficiencies} document deficiency(ies) open. Request uploads from customer or DSA.`,
        priority: 90,
      });
    }

    if (ctx.daysSinceLastActivity !== undefined && ctx.daysSinceLastActivity > 3) {
      actions.push({
        actionType: 'CALL_CUSTOMER',
        title: 'Call customer',
        description: 'No activity in 3+ days. Schedule a qualification call.',
        priority: 85,
      });
      actions.push({
        actionType: 'SCHEDULE_FOLLOW_UP',
        title: 'Schedule follow-up',
        description: 'Set a follow-up reminder for the assigned executive.',
        priority: 75,
      });
    }

    if (ctx.leadStatus === 'NEW' || ctx.leadStatus === 'ASSIGNED') {
      actions.push({
        actionType: 'CALL_CUSTOMER',
        title: 'Qualify lead',
        description: 'Conduct initial qualification call to confirm income, product fit, and urgency.',
        priority: 80,
      });
    }

    if (ctx.approvalProbability !== undefined && ctx.approvalProbability >= 75) {
      actions.push({
        actionType: 'RECOMMEND_CROSS_SELL',
        title: 'Cross-sell opportunity',
        description: 'Strong approval probability — present insurance or top-up options.',
        priority: 65,
      });
    }

    if (ctx.slaBreached) {
      actions.push({
        actionType: 'ESCALATE_CASE',
        title: 'Escalate SLA breach',
        description: 'Lead SLA breached. Escalate to branch manager for immediate action.',
        priority: 95,
      });
    }

    actions.push({
      actionType: 'SEND_REMINDER',
      title: 'Send WhatsApp reminder',
      description: 'Send document checklist or next-step reminder via WhatsApp.',
      priority: 50,
    });

    return actions.sort((a, b) => b.priority - a.priority).slice(0, 6);
  },

  forApplication(ctx: NbaContext): CopilotAction[] {
    const actions: CopilotAction[] = [];

    if (ctx.openDeficiencies && ctx.openDeficiencies > 0) {
      actions.push({
        actionType: 'COLLECT_DOCUMENTS',
        title: 'Resolve document deficiencies',
        description: `${ctx.openDeficiencies} open deficiency(ies) blocking progression.`,
        priority: 92,
      });
    }

    if (ctx.bankLoginPending) {
      actions.push({
        actionType: 'UPDATE_BANK_LOGIN',
        title: 'Complete bank login',
        description: 'Bank login pending. Coordinate with lender RM to submit login.',
        priority: 88,
      });
    }

    if (ctx.creditReviewPending) {
      actions.push({
        actionType: 'ESCALATE_CASE',
        title: 'Expedite credit review',
        description: 'Credit review pending beyond SLA. Escalate to credit operations.',
        priority: 86,
      });
    }

    if (ctx.sanctionPending) {
      actions.push({
        actionType: 'SEND_REMINDER',
        title: 'Follow up on sanction',
        description: 'Sanction stage pending. Send reminder to lender and customer.',
        priority: 78,
      });
    }

    if (ctx.disbursalPending) {
      actions.push({
        actionType: 'CALL_CUSTOMER',
        title: 'Confirm disbursal readiness',
        description: 'Verify customer availability and final documentation for disbursal.',
        priority: 84,
      });
    }

    if (ctx.slaBreached) {
      actions.push({
        actionType: 'ESCALATE_CASE',
        title: 'Escalate delayed application',
        description: 'Application SLA breached. Notify operations head.',
        priority: 94,
      });
    }

    if (ctx.approvalProbability !== undefined && ctx.approvalProbability >= 70) {
      actions.push({
        actionType: 'RECOMMEND_TOP_UP',
        title: 'Recommend top-up at sanction',
        description: 'High success probability — discuss top-up at sanction stage.',
        priority: 60,
      });
    }

    return actions.sort((a, b) => b.priority - a.priority).slice(0, 6);
  },
};

export const crossSellService = {
  detect(params: {
    approvalProbability: number;
    productSlug?: string;
    hasExistingLoan?: boolean;
    propertyValue?: number;
    vehicleValue?: number;
    businessTurnover?: number;
  }): CopilotCrossSell[] {
    const score = params.approvalProbability;
    const opportunities: CopilotCrossSell[] = [];

    for (const product of CROSS_SELL_PRODUCTS) {
      if (score < product.minScore) continue;

      let boost = 0;
      if (product.code === 'LAP' && params.propertyValue && params.propertyValue > 2000000) boost = 15;
      if (product.code === 'AUTO_LOAN' && params.vehicleValue && params.vehicleValue > 500000) boost = 12;
      if (product.code === 'BUSINESS_LOAN' && params.businessTurnover && params.businessTurnover > 5000000) boost = 10;
      if (product.code === 'BALANCE_TRANSFER' && params.hasExistingLoan) boost = 20;
      if (product.code === 'TOP_UP' && params.hasExistingLoan) boost = 18;

      const finalScore = Math.min(99, score + boost);
      if (finalScore >= product.minScore) {
        opportunities.push({
          code: product.code,
          label: product.label,
          description: `Eligible cross-sell based on profile score ${finalScore}%`,
          score: finalScore,
        });
      }
    }

    return opportunities.sort((a, b) => b.score - a.score).slice(0, 5);
  },
};

export type { NbaContext };
