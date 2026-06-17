import type { AuthenticatedUser } from '@kuberone/shared-types';
import { type automationAiSuggestSchema } from '@kuberone/shared-validation';
import type { z } from 'zod';

import { env } from '../../../config/env.js';
import { openAiService } from '../../ai-advisor/services/openai.service.js';

type AiSuggestInput = z.infer<typeof automationAiSuggestSchema>;

const JOURNEY_HINTS: Record<string, string> = {
  LEAD_NURTURING: 'Email day 1, SMS day 3, WhatsApp day 7 with score-based branch to sales assignment.',
  APPLICATION_FOLLOWUP: 'Push reminder at 24h, email document checklist at 48h, escalate at 72h.',
  CUSTOMER_ONBOARDING: 'Welcome email immediately, AI recommendations day 2, product push day 5.',
  REFERRAL_AUTOMATION: 'Dual-channel referral invite, reward notification on conversion.',
  FEEDBACK_CAMPAIGN: '1-hour delay after ticket close, email + push CSAT request.',
};

export const automationAiService = {
  async suggest(_actor: AuthenticatedUser, input: AiSuggestInput) {
    const journeyType = input.journeyType ?? 'LEAD_NURTURING';
    const baseContext = input.context ?? {};

    if (!env.OPENAI_API_KEY) {
      return automationAiService.ruleBasedSuggest(input.type, journeyType, baseContext);
    }

    try {
      const prompt = buildPrompt(input);
      const reply = await openAiService.chat([
        {
          role: 'system',
          content:
            'You are a marketing automation architect for Kuber Finserve fintech. Return concise JSON with keys: title, description, nodes (array), triggers (array), timing, audience, content.',
        },
        { role: 'user', content: prompt },
      ]);

      return { source: 'ai', type: input.type, journeyType, suggestion: reply.content };
    } catch {
      return automationAiService.ruleBasedSuggest(input.type, journeyType, baseContext);
    }
  },

  ruleBasedSuggest(type: string, journeyType: string, context: Record<string, unknown>) {
    const hint = JOURNEY_HINTS[journeyType] ?? 'Multi-channel nurture with conditions on lead score and delays.';

    const suggestions: Record<string, unknown> = {
      journey: {
        title: `${journeyType.replace(/_/g, ' ')} Journey`,
        description: hint,
        recommendedTriggers: ['LEAD_CREATED', 'APPLICATION_CREATED'].filter((t) =>
          journeyType.includes('LEAD') ? t.startsWith('LEAD') : true,
        ),
        goals: ['APPLICATION_SUBMITTED'],
      },
      workflow: {
        nodes: [
          { type: 'TRIGGER', label: 'Entry Trigger' },
          { type: 'DELAY', label: 'Wait 24 Hours', config: { delayType: 'HOURS', value: 24 } },
          { type: 'ACTION', label: 'Send Email', actions: [{ actionType: 'SEND_EMAIL', templateCode: 'CAMPAIGN_EMAIL' }] },
          { type: 'CONDITION', label: 'Score >= 70', conditions: [{ field: 'leadScore', operator: 'gte', value: 70 }] },
          { type: 'GOAL', label: 'Conversion Goal' },
        ],
      },
      trigger: {
        recommended: journeyType.includes('REFERRAL') ? ['REFERRAL_CREATED', 'REFERRAL_CONVERTED'] : ['LEAD_CREATED'],
        timing: 'immediate',
      },
      timing: { bestHours: [10, 11, 17, 18], bestDays: ['Tue', 'Wed', 'Thu'], delayRecommendation: '24-48h between touches' },
      audience: {
        segments: ['High score leads', 'Stalled applications', 'Inactive customers'],
        filters: context,
      },
      content: {
        emailSubject: 'Your Kuber Finserve loan journey update',
        smsBody: 'Hi {{name}}, complete your application on KuberOne.',
        whatsappTemplate: 'LEAD_FOLLOWUP',
        pushTitle: 'Action needed',
      },
    };

    return { source: 'rules', type, journeyType, suggestion: suggestions[type] ?? suggestions.journey };
  },
};

function buildPrompt(input: AiSuggestInput): string {
  return [
    `Suggest ${input.type} for journey type ${input.journeyType ?? 'LEAD_NURTURING'}.`,
    input.prompt ? `User prompt: ${input.prompt}` : '',
    input.context ? `Context: ${JSON.stringify(input.context)}` : '',
    'Channels available: Email, SMS, WhatsApp, Push. Integrate with existing notification engine.',
  ]
    .filter(Boolean)
    .join('\n');
}
