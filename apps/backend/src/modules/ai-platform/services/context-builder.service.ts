import { prisma } from '../../../config/database.js';
import { knowledgeContextService } from '../../knowledge-base/services/knowledge-context.service.js';
import { ragContextService } from '../../rag/services/rag-context.service.js';
import type { PlatformContextInput, PlatformContextResult } from '../types/ai-platform.types.js';

export const aiPlatformContextBuilderService = {
  async build(input: PlatformContextInput): Promise<PlatformContextResult> {
    const [customer, lead, application, ragCtx, kbSnippets] = await Promise.all([
      input.customerId
        ? prisma.customer.findUnique({ where: { id: input.customerId }, select: { id: true, fullName: true, customerCode: true, kycStatus: true } })
        : null,
      input.leadId
        ? prisma.lead.findUnique({
            where: { id: input.leadId },
            select: { id: true, leadNumber: true, prospectName: true, status: true, score: true, grade: true, requestedAmount: true },
          })
        : null,
      input.applicationId
        ? prisma.application.findUnique({
            where: { id: input.applicationId },
            select: { id: true, applicationNumber: true, status: true, requestedAmount: true },
          })
        : null,
      input.ragQuery
        ? ragContextService.getSnippetStrings(
            input.ragQuery,
            { topK: 8, productCode: input.productCode, source: input.module as never },
            input.userId,
          ).catch(() => [] as string[])
        : Promise.resolve([] as string[]),
      knowledgeContextService.getSnippetStrings(6, input.productCode).catch(() => [] as string[]),
    ]);

    const roleContext = input.roleCodes?.length
      ? [`User roles: ${input.roleCodes.join(', ')}`]
      : [];

    const knowledgeSnippets = kbSnippets;
    const ragSnippets = ragCtx;

    const parts = [
      customer ? `Customer: ${customer.fullName} (${customer.id})` : null,
      lead ? `Lead: ${lead.prospectName} — ${lead.status}, score ${lead.score ?? 'N/A'}` : null,
      application ? `Application: ${application.applicationNumber} — ${application.status}` : null,
      ...roleContext,
      ...ragSnippets.map((s) => `[RAG] ${s}`),
      ...knowledgeSnippets.map((s) => `[KB] ${s}`),
    ].filter(Boolean) as string[];

    return {
      customer: customer as Record<string, unknown> | undefined,
      lead: lead as Record<string, unknown> | undefined,
      application: application as Record<string, unknown> | undefined,
      knowledgeSnippets,
      ragSnippets,
      roleContext,
      combinedContext: parts.join('\n'),
    };
  },
};
