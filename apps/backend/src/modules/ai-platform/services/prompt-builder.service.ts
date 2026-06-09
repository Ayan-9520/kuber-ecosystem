import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';

import { aiPlatformRepository } from '../repositories/ai-platform.repository.js';
import type { AiModuleSource } from '../types/ai-platform.types.js';

function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? '');
}

export const aiPlatformPromptBuilderService = {
  async getTemplate(code: string, variables?: Record<string, string>): Promise<string | null> {
    const template = await aiPlatformRepository.findPromptTemplate(code);
    const version = template?.versions[0];
    if (!version) return null;
    return variables ? interpolate(version.content, variables) : version.content;
  },

  async buildSystemPrompt(module: AiModuleSource, code: string, variables?: Record<string, string>): Promise<string> {
    const fromDb = await this.getTemplate(code, variables);
    if (fromDb) return fromDb;
    return `You are KuberOne AI for Kuber Finserve (${module}). Provide accurate, compliant fintech guidance. Use ₹ Indian format. Never guarantee loan approvals.`;
  },

  buildChatMessages(params: {
    systemPrompt: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    userMessage: string;
    contextBlock?: string;
  }): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: params.contextBlock
          ? `${params.systemPrompt}\n\n=== CONTEXT ===\n${params.contextBlock}`
          : params.systemPrompt,
      },
    ];

    for (const msg of params.history ?? []) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: 'user', content: params.userMessage });
    return messages;
  },

  async listTemplates(module?: AiModuleSource) {
    return aiPlatformRepository.listPromptTemplates(module);
  },
};
