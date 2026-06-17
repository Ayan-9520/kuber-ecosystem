import { contentRepository } from '../repositories/content.repository.js';

import { contentGenerationService } from './content-generation.service.js';

export const contentQueueService = {
  async processBatch(limit: number) {
    const items = await contentRepository.queue.findDue(limit);
    const results = [];

    for (const item of items) {
      await contentRepository.queue.update(item.id, { status: 'PROCESSING' });
      try {
        const payload = item.payload as { input: Parameters<typeof contentGenerationService.executeGeneration>[0]['input'] } | null;
        if (!payload?.input || !item.request) {
          throw new Error('Invalid queue payload');
        }

        const personalization = (item.request.personalization ?? {}) as Record<string, unknown>;
        await contentGenerationService.executeGeneration({
          requestId: item.requestId,
          input: payload.input,
          template: item.request.template,
          personalization,
          actorId: item.request.requestedById,
          start: Date.now(),
        });

        await contentRepository.queue.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        results.push({ id: item.id, status: 'COMPLETED' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const retryCount = item.retryCount + 1;
        if (retryCount >= item.maxRetries) {
          await contentRepository.queue.update(item.id, { status: 'FAILED', lastError: message, retryCount });
        } else {
          await contentRepository.queue.update(item.id, {
            status: 'PENDING',
            retryCount,
            lastError: message,
            scheduledAt: new Date(Date.now() + retryCount * 30_000),
          });
        }
        results.push({ id: item.id, status: 'FAILED', error: message });
      }
    }

    return { processed: results.length, results };
  },
};
