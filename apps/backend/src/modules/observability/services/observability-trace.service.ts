import { observabilityRepository } from '../repositories/observability.repository.js';

export const observabilityTraceService = {
  async record(input: {
    traceId: string;
    correlationId?: string;
    requestId?: string;
    operation: string;
    status: 'OK' | 'ERROR' | 'UNSET';
    durationMs: number;
    userId?: string;
    startedAt: Date;
    endedAt?: Date;
    metadata?: Record<string, unknown>;
  }) {
    if (Math.random() > Number(process.env.TRACE_SAMPLE_RATE ?? '0.5')) return;

    await observabilityRepository.trace.upsert(
      input.traceId,
      {
        traceId: input.traceId,
        correlationId: input.correlationId,
        requestId: input.requestId,
        operation: input.operation,
        status: input.status,
        durationMs: input.durationMs,
        user: input.userId ? { connect: { id: input.userId } } : undefined,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        metadata: input.metadata as never,
      },
      {
        status: input.status,
        durationMs: input.durationMs,
        endedAt: input.endedAt,
        metadata: input.metadata as never,
      },
    ).catch(() => {
      // Observability tables may be absent on partial migrations — never crash API requests.
    });
  },
};
