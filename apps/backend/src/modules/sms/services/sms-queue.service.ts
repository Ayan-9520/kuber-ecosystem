import type { Prisma } from '@kuberone/database';
import type { ListSmsQueueQuery } from '@kuberone/shared-validation';

import { SMS_RETRY_DELAY_MS } from '../constants/sms.constants.js';
import { smsQueueRepository } from '../repositories/sms.repository.js';
import { buildPaginationMeta } from '../utils/sms.utils.js';

import { smsOrchestratorService } from './sms-orchestrator.service.js';

export const smsQueueService = {
  async list(query: ListSmsQueueQuery) {
    const where: Prisma.SmsQueueWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.queueType ? { queueType: query.queueType as never } : {}),
      ...(query.priority ? { priority: query.priority as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      smsQueueRepository.list(where, skip, query.limit),
      smsQueueRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async processBatch(limit = 25) {
    const items = await smsQueueRepository.listPending(limit);
    const results: Array<{ id: string; success: boolean }> = [];

    for (const item of items) {
      await smsQueueRepository.update(item.id, { status: 'PROCESSING' });
      try {
        await smsOrchestratorService.dispatchNow({
          toPhone: item.toPhone,
          userId: item.recipientUserId ?? undefined,
          templateCode: item.templateCode ?? undefined,
          body: item.body ?? undefined,
          variables: (item.variables as Record<string, unknown>) ?? undefined,
          priority: item.priority,
        });
        await smsQueueRepository.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        results.push({ id: item.id, success: true });
      } catch (error) {
        const retryCount = item.retryCount + 1;
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (retryCount >= item.maxRetries) {
          await smsQueueRepository.update(item.id, { status: 'FAILED', queueType: 'FAILED', retryCount, lastError: message });
        } else {
          await smsQueueRepository.update(item.id, {
            status: 'PENDING',
            queueType: 'RETRY',
            retryCount,
            lastError: message,
            scheduledAt: new Date(Date.now() + SMS_RETRY_DELAY_MS * retryCount),
          });
        }
        results.push({ id: item.id, success: false });
      }
    }

    return results;
  },
};
