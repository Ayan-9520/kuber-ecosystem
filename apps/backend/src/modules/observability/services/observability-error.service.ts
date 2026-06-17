import { maskPii } from '../../../shared/observability/pii-mask.js';
import { observabilityRepository } from '../repositories/observability.repository.js';

export const observabilityErrorService = {
  async record(input: {
    source?: string;
    errorCode?: string;
    errorType: string;
    message: string;
    stackTrace?: string;
    requestId?: string;
    correlationId?: string;
    traceId?: string;
    userId?: string;
    module?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    metadata?: Record<string, unknown>;
  }) {
    return observabilityRepository.error.create({
      source: (input.source ?? 'BACKEND') as never,
      errorCode: input.errorCode,
      errorType: input.errorType,
      message: maskPii(input.message) as string,
      stackTrace: input.stackTrace ? (maskPii(input.stackTrace) as string) : undefined,
      requestId: input.requestId,
      correlationId: input.correlationId,
      traceId: input.traceId,
      user: input.userId ? { connect: { id: input.userId } } : undefined,
      module: input.module,
      path: input.path,
      method: input.method,
      statusCode: input.statusCode,
      metadata: maskPii(input.metadata ?? {}) as never,
    });
  },
};
