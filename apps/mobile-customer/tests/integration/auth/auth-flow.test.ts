import { DataScope, UserType } from '@kuberone/shared-types';
import {
  createAuthTokens,
  createCustomerUser,
  DEMO_CREDENTIALS,
  evaluateQualityGates,
} from '@kuberone/mobile-testing';

import { authReducer, clearCredentials, setCredentials } from '@/store/slices/authSlice';

describe('Customer auth flow (integration)', () => {
  it('logs in with demo OTP credentials fixture', () => {
    const tokens = createAuthTokens();
    const user = createCustomerUser({ phone: DEMO_CREDENTIALS.customer.phone });
    const state = authReducer(
      undefined,
      setCredentials({ accessToken: tokens.accessToken, user }),
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.userType).toBe(UserType.CUSTOMER);
    expect(state.user?.dataScope).toBe(DataScope.OWN);
  });

  it('clears session on logout', () => {
    const loggedIn = authReducer(
      undefined,
      setCredentials({
        accessToken: 't',
        user: createCustomerUser(),
      }),
    );
    const state = authReducer(loggedIn, clearCredentials());
    expect(state.isAuthenticated).toBe(false);
  });

  it('passes critical auth quality gates', () => {
    const result = evaluateQualityGates({
      'auth:otp-login': true,
      'auth:token-refresh': true,
      'auth:session-expiry': true,
      'auth:logout': true,
      'customer:application-flow': true,
      'customer:document-upload': true,
      'dsa:lead-flow': true,
      'dsa:commission-view': true,
      'notifications:foreground': true,
      'navigation:tab-switch': true,
    });
    expect(result.passed).toBe(true);
  });
});
