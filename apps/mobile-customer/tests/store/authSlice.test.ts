import { authReducer, clearCredentials, setCredentials } from '@/store/slices/authSlice';
import { DataScope, UserType } from '@kuberone/shared-types';

describe('authSlice', () => {
  it('sets credentials on login', () => {
    const state = authReducer(
      undefined,
      setCredentials({
        accessToken: 'token-1',
        user: {
          id: 'u1',
          sub: 'u1',
          sessionId: 's1',
          userType: UserType.CUSTOMER,
          roles: ['CUSTOMER'],
          permissions: [],
          dataScope: DataScope.OWN,
          customerId: 'c1',
        },
      }),
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('token-1');
  });

  it('clears credentials on logout', () => {
    const loggedIn = authReducer(
      undefined,
      setCredentials({
        accessToken: 'token-1',
        user: {
          id: 'u1',
          sub: 'u1',
          sessionId: 's1',
          userType: UserType.CUSTOMER,
          roles: ['CUSTOMER'],
          permissions: [],
          dataScope: DataScope.OWN,
        },
      }),
    );
    const state = authReducer(loggedIn, clearCredentials());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
