import type { Prisma } from '@kuberone/database';
import type { ListEmailQueueQuery } from '@kuberone/shared-validation';

import { EMAIL_RETRY_DELAY_MS } from '../constants/email.constants.js';
import { emailQueueRepository } from '../repositories/email.repository.js';
import { buildPaginationMeta } from '../utils/email.utils.js';

import { emailOrchestratorService } from './email-orchestrator.service.js';

export const emailQueueService = {
  async list(query: ListEmailQueueQuery) {
    const where: Prisma.EmailQueueWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.queueType ? { queueType: query.queueType as never } : {}),
      ...(query.priority ? { priority: query.priority as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      emailQueueRepository.list(where, skip, query.limit),
      emailQueueRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async processBatch(limit = 20) {
    const items = await emailQueueRepository.listPending(limit);
    const results: Array<{ id: string; success: boolean }> = [];

    for (const item of items) {
      await emailQueueRepository.update(item.id, { status: 'PROCESSING' });
      try {
        await emailOrchestratorService.dispatchNow({
          toEmail: item.toEmail,
          userId: item.recipientUserId ?? undefined,
          templateCode: item.templateCode ?? undefined,
          subject: item.subject ?? undefined,
          htmlBody: item.htmlBody ?? undefined,
          textBody: item.textBody ?? undefined,
          variables: (item.variables as Record<string, unknown>) ?? undefined,
          priority: item.priority,
        });
        await emailQueueRepository.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        results.push({ id: item.id, success: true });
      } catch (error) {
        const retryCount = item.retryCount + 1;
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (retryCount >= item.maxRetries) {
          await emailQueueRepository.update(item.id, {
            status: 'FAILED',
            queueType: 'FAILED',
            retryCount,
            lastError: message,
          });
        } else {
          await emailQueueRepository.update(item.id, {
            status: 'PENDING',
            queueType: 'RETRY',
            retryCount,
            lastError: message,
            scheduledAt: new Date(Date.now() + EMAIL_RETRY_DELAY_MS * retryCount),
          });
        }
        results.push({ id: item.id, success: false });
      }
    }

    return results;
  },
};
