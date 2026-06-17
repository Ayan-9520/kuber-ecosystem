import { UserType } from '@kuberone/shared-types';
import { createAuthTokens, createPartnerUser, DEMO_CREDENTIALS } from '@kuberone/mobile-testing';

import { authReducer, setCredentials } from '@/store/slices/authSlice';

describe('DSA auth flow', () => {
  it('authenticates DSA partner with demo credentials', () => {
    const state = authReducer(
      undefined,
      setCredentials({
        accessToken: createAuthTokens().accessToken,
        user: createPartnerUser({ phone: DEMO_CREDENTIALS.dsaPartner.phone }),
      }),
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.userType).toBe(UserType.PARTNER);
    expect(state.user?.partnerId).toBeTruthy();
  });
});
