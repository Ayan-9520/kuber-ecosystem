import type { AuthenticatedUser, DataScope } from '@kuberone/shared-types';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthenticatedUser;
      sessionId?: string;
      dataScope?: DataScope;
    }
  }
}

export {};
