import type { AuthenticatedUser } from '@kuberone/shared-types';
import { UserType } from '@kuberone/shared-types';

import type { AiAudience, AiLanguage } from '../constants/ai-advisor.constants.js';
import {
  AGENT_NAME,
  FINTECH_KNOWLEDGE_BASE,
  LANGUAGE_LABELS,
} from '../constants/ai-advisor.constants.js';
import type { AiAdvisorContext } from '../types/ai-advisor.types.js';

export const promptBuilderService = {
  resolveAudience(actor: AuthenticatedUser): AiAudience {
    if (actor.userType === UserType.PARTNER) return 'dsa';
    if (actor.userType === UserType.CUSTOMER) return 'customer';
    return 'crm';
  },

  buildSystemPrompt(params: {
    audience: AiAudience;
    language: AiLanguage;
    context: AiAdvisorContext;
  }): string {
    const { audience, language, context } = params;

    const audienceGuide = {
      customer: `You assist loan customers of Kuber Finserve. Answer: suitable loan products, eligibility, EMI, documents, application status, lender fit, cross-sell.`,
      dsa: `You assist DSA partners. Answer: lender selection, approval probability, missing documents, next best actions, lead qualification.`,
      crm: `You assist Kuber Finserve CRM users. Provide: lead summary, risk summary, approval probability, lender recommendation, follow-up actions.`,
    }[audience];

    const languageGuide =
      language === 'hi'
        ? 'Respond in Hindi using Devanagari script. Keep financial terms clear.'
        : language === 'hinglish'
          ? 'Respond in Hinglish — natural mix of Hindi and English as spoken in India.'
          : 'Respond in clear professional English.';

    return [
      `You are ${AGENT_NAME}, the official AI advisor for KuberOne by Kuber Finserve.`,
      audienceGuide,
      languageGuide,
      'Use ONLY the structured context data provided. Never invent loan statuses, amounts, or approvals.',
      'If data is missing, say what is missing and suggest the in-app action (Documents, Applications, Leads).',
      'Be concise, premium fintech tone. Use bullet points for lists. Include ₹ amounts in Indian format when available.',
      'Compliance: do not guarantee approval; use probability/eligibility language.',
      '',
      '=== LIVE CONTEXT (JSON) ===',
      JSON.stringify(context, null, 2),
      '',
      '=== KNOWLEDGE BASE ===',
      (context.knowledgeSnippets ?? FINTECH_KNOWLEDGE_BASE).join('\n'),
    ].join('\n');
  },

  buildChatMessages(params: {
    systemPrompt: string;
    history: { role: 'user' | 'assistant'; content: string }[];
    userMessage: string;
  }) {
    return [
      { role: 'system' as const, content: params.systemPrompt },
      ...params.history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: params.userMessage },
    ];
  },

  languageLabel(language: AiLanguage): string {
    return LANGUAGE_LABELS[language];
  },
};
