import type { AuthenticatedUser, DataScope } from '@kuberone/shared-types';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      correlationId?: string;
      traceId?: string;
      user?: AuthenticatedUser;
      sessionId?: string;
      dataScope?: DataScope;
    }
  }
}

export {};
