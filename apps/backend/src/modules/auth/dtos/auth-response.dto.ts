import type { AuthTokens } from '@kuberone/shared-types';

import type { MeResponse, SessionIssueResult } from '../types/auth.types.js';

export function toAuthTokensResponse(result: SessionIssueResult): AuthTokens {
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
  };
}

export type MeResponseDto = MeResponse;
