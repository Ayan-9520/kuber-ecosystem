import { maskPii } from '../../../shared/observability/pii-mask.js';
import { observabilityRepository } from '../repositories/observability.repository.js';

export const observabilityEventService = {
  async emit(input: {
    eventType: 'BUSINESS' | 'AUTH' | 'SECURITY' | 'WORKFLOW' | 'AI' | 'NOTIFICATION';
    eventName: string;
    category?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    requestId?: string;
    correlationId?: string;
    traceId?: string;
    workflowId?: string;
    payload?: Record<string, unknown>;
  }) {
    return observabilityRepository.event.create({
      eventType: input.eventType,
      eventName: input.eventName,
      category: (input.category ?? 'BUSINESS') as never,
      entityType: input.entityType,
      entityId: input.entityId,
      user: input.userId ? { connect: { id: input.userId } } : undefined,
      requestId: input.requestId,
      correlationId: input.correlationId,
      traceId: input.traceId,
      workflowId: input.workflowId,
      payload: maskPii(input.payload ?? {}) as never,
    });
  },
};
