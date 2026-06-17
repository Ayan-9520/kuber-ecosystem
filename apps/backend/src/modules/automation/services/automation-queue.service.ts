import { env } from '../../../config/env.js';
import { automationRepository } from '../repositories/automation.repository.js';

import { automationEngineService } from './automation-engine.service.js';
import { automationLogService } from './automation-log.service.js';

export const automationQueueService = {
  async enqueue(params: {
    executionId: string;
    nodeKey: string;
    scheduledAt: Date;
    payload?: Record<string, unknown>;
  }) {
    return automationRepository.queue.enqueue({
      execution: { connect: { id: params.executionId } },
      nodeKey: params.nodeKey,
      scheduledAt: params.scheduledAt,
      status: 'PENDING',
      payload: params.payload as never,
      maxRetries: env.AUTOMATION_MAX_RETRIES,
    });
  },

  async processBatch(limit: number) {
    const items = await automationRepository.queue.findDue(limit);
    const results = [];

    for (const item of items) {
      await automationRepository.queue.update(item.id, { status: 'PROCESSING' });
      try {
        await automationEngineService.processNode(item.execution, item.nodeKey);
        await automationRepository.queue.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        results.push({ id: item.id, status: 'COMPLETED' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const retryCount = item.retryCount + 1;
        if (retryCount >= item.maxRetries) {
          await automationRepository.queue.update(item.id, { status: 'DEAD_LETTER', lastError: message, retryCount });
          await automationRepository.deadLetter.create({
            execution: { connect: { id: item.executionId } },
            nodeKey: item.nodeKey,
            payload: item.payload as never,
            error: message,
            retryCount,
          });
          await automationLogService.write({
            executionId: item.executionId,
            workflowId: item.execution.workflowId,
            nodeKey: item.nodeKey,
            level: 'ERROR',
            message: `Moved to dead letter: ${message}`,
          });
        } else {
          const backoff = new Date(Date.now() + retryCount * 60_000);
          await automationRepository.queue.update(item.id, {
            status: 'PENDING',
            retryCount,
            lastError: message,
            scheduledAt: backoff,
          });
        }
        results.push({ id: item.id, status: 'FAILED', error: message });
      }
    }

    return { processed: results.length, results };
  },
};
