import { AGENT_NAME } from '../../ai-advisor/constants/ai-advisor.constants.js';
import type { CompletionResult } from '../types/ai-platform.types.js';

export const rulesEngineService = {
  fallbackReply(params: {
    intent?: string;
    language?: 'en' | 'hi' | 'hinglish';
    structured?: Record<string, unknown>;
    userMessage?: string;
  }): CompletionResult {
    const { intent = 'general', language = 'en', structured = {} } = params;
    const content = buildRulesEngineReply(intent, language, structured);
    return {
      content,
      model: 'kuber-rules-engine-v1',
      provider: 'rules-engine',
      latencyMs: 0,
      usedFallback: true,
    };
  },
};

function buildRulesEngineReply(
  intent: string,
  language: 'en' | 'hi' | 'hinglish',
  data: Record<string, unknown>,
): string {
  const ctx = data.context as Record<string, unknown> | undefined;
  const en = language === 'en';

  if (intent === 'emi' && ctx?.emiPreview) {
    const emi = ctx.emiPreview as Record<string, unknown>;
    return en
      ? `Estimated EMI: ₹${Number(emi.emi).toLocaleString('en-IN')} for ${emi.tenureMonths} months at ${emi.interestRate}%.`
      : `Aapka estimated EMI ₹${Number(emi.emi).toLocaleString('en-IN')} hai.`;
  }

  if (intent === 'eligibility' && ctx?.eligibility) {
    const e = ctx.eligibility as Record<string, unknown>;
    return `Eligibility: ${e.outcome}. Approval probability ${e.approvalProbability}%.`;
  }

  const prefix = en
    ? `I'm ${AGENT_NAME}. I can help with loans, eligibility, EMI, documents, and applications.`
    : `Main ${AGENT_NAME} hoon — loans, eligibility, EMI aur documents mein help kar sakta hoon.`;

  const actions = (ctx?.nextBestActions as string[] | undefined)?.join('\n• ');
  return actions ? `${prefix}\n\nNext steps:\n• ${actions}` : prefix;
}
