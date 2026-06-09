import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '@prisma/client';

export async function seedAiPlatform(prisma: PrismaClient): Promise<void> {
  const openaiId = randomUUID();

  await prisma.aiProvider.upsert({
    where: { code: 'openai' },
    create: {
      id: openaiId,
      code: 'openai',
      name: 'OpenAI',
      providerType: 'OPENAI',
      isActive: true,
      config: { realtimeReady: true },
    },
    update: { isActive: true },
  });

  const provider = await prisma.aiProvider.findUnique({ where: { code: 'openai' } });
  if (!provider) return;

  const models = [
    { code: 'gpt-4o-mini', name: 'GPT-4o Mini', capability: 'CHAT' as const, isDefault: true, maxTokens: 4096, costIn: 0.00015, costOut: 0.0006 },
    { code: 'gpt-4o', name: 'GPT-4o', capability: 'CHAT' as const, isDefault: false, maxTokens: 4096, costIn: 0.0025, costOut: 0.01 },
    { code: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', capability: 'CHAT' as const, isDefault: false, maxTokens: 4096, costIn: 0.0004, costOut: 0.0016 },
    { code: 'text-embedding-3-small', name: 'Embedding 3 Small', capability: 'EMBEDDING' as const, isDefault: true, dimensions: 1536, costIn: 0.00002, costOut: 0 },
    { code: 'whisper-1', name: 'Whisper', capability: 'TRANSCRIPTION' as const, isDefault: true, costIn: 0.006, costOut: 0 },
    { code: 'tts-1', name: 'TTS-1', capability: 'TTS' as const, isDefault: true, costIn: 0.015, costOut: 0 },
    { code: 'text-moderation-latest', name: 'Moderation', capability: 'MODERATION' as const, isDefault: true, costIn: 0, costOut: 0 },
  ];

  const modelIds: Record<string, string> = {};

  for (const m of models) {
    const existing = await prisma.aiModel.findFirst({
      where: { providerId: provider.id, code: m.code },
    });
    const id = existing?.id ?? randomUUID();
    modelIds[m.code] = id;

    await prisma.aiModel.upsert({
      where: { providerId_code: { providerId: provider.id, code: m.code } },
      create: {
        id,
        providerId: provider.id,
        code: m.code,
        name: m.name,
        capability: m.capability,
        isDefault: m.isDefault,
        isActive: true,
        maxTokens: m.maxTokens,
        dimensions: m.dimensions,
        costPer1kIn: m.costIn,
        costPer1kOut: m.costOut,
      },
      update: { isActive: true, isDefault: m.isDefault },
    });
  }

  const routes: Array<{ module: 'AI_ADVISOR' | 'VOICE_AI' | 'COPILOT' | 'RECOMMENDATION' | 'RAG' | 'KNOWLEDGE'; capability: 'CHAT' | 'EMBEDDING' | 'TRANSCRIPTION' | 'TTS'; primary: string; fallback?: string }> = [
    { module: 'AI_ADVISOR', capability: 'CHAT', primary: 'gpt-4o-mini', fallback: 'gpt-4o' },
    { module: 'VOICE_AI', capability: 'CHAT', primary: 'gpt-4o-mini', fallback: 'gpt-4o' },
    { module: 'VOICE_AI', capability: 'TRANSCRIPTION', primary: 'whisper-1' },
    { module: 'VOICE_AI', capability: 'TTS', primary: 'tts-1' },
    { module: 'COPILOT', capability: 'CHAT', primary: 'gpt-4o-mini' },
    { module: 'RECOMMENDATION', capability: 'CHAT', primary: 'gpt-4o-mini' },
    { module: 'RAG', capability: 'CHAT', primary: 'gpt-4o-mini' },
    { module: 'RAG', capability: 'EMBEDDING', primary: 'text-embedding-3-small' },
    { module: 'KNOWLEDGE', capability: 'CHAT', primary: 'gpt-4o-mini' },
  ];

  for (const route of routes) {
    const primaryId = modelIds[route.primary];
    if (!primaryId) continue;
    const fallbackId = route.fallback ? modelIds[route.fallback] : undefined;

    await prisma.aiModelRoute.upsert({
      where: { module_capability: { module: route.module, capability: route.capability } },
      create: {
        id: randomUUID(),
        module: route.module,
        capability: route.capability,
        primaryModelId: primaryId,
        fallbackModelId: fallbackId,
        isActive: true,
      },
      update: {
        primaryModelId: primaryId,
        fallbackModelId: fallbackId,
        isActive: true,
      },
    });
  }

  const prompts = [
    {
      code: 'advisor.system',
      name: 'AI Advisor System Prompt',
      module: 'AI_ADVISOR' as const,
      role: 'system',
      content: 'You are {{agentName}}, the AI Advisor for Kuber Finserve KuberOne platform. Provide accurate loan guidance using provided context. Use ₹ Indian format. Never guarantee approvals. Audience: {{audience}}. Language: {{language}}.',
    },
    {
      code: 'rag.answer',
      name: 'RAG Answer Generation',
      module: 'RAG' as const,
      role: 'system',
      content: 'You are KuberOne AI for Kuber Finserve. Answer ONLY using retrieved knowledge. If insufficient, state what is missing. Use ₹ Indian format. Do not guarantee approvals.',
    },
    {
      code: 'copilot.insight',
      name: 'Copilot Insight Generation',
      module: 'COPILOT' as const,
      role: 'system',
      content: 'You are the AI Sales Copilot for Kuber Finserve. Generate actionable sales insights, risk explanations, and next-best-actions for relationship managers. Be concise and data-driven.',
    },
  ];

  for (const p of prompts) {
    const template = await prisma.aiPromptTemplate.upsert({
      where: { code: p.code },
      create: {
        id: randomUUID(),
        code: p.code,
        name: p.name,
        module: p.module,
        role: p.role,
        isActive: true,
      },
      update: { isActive: true },
    });

    const existingVersion = await prisma.aiPromptVersion.findFirst({
      where: { templateId: template.id, version: 1 },
    });
    if (!existingVersion) {
      await prisma.aiPromptVersion.create({
        data: {
          id: randomUUID(),
          templateId: template.id,
          version: 1,
          content: p.content,
          isActive: true,
        },
      });
    }
  }

  console.log('  → ai-platform seeded');
}
