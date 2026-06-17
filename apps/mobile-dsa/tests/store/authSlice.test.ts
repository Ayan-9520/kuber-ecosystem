import { authReducer, setCredentials } from '@/store/slices/authSlice';
import { DataScope, UserType } from '@kuberone/shared-types';

describe('DSA authSlice', () => {
  it('authenticates partner user', () => {
    const state = authReducer(
      undefined,
      setCredentials({
        accessToken: 'dsa-token',
        user: {
          id: 'p-user',
          sub: 'p-user',
          sessionId: 's1',
          userType: UserType.PARTNER,
          roles: ['PARTNER'],
          permissions: ['leads.read'],
          dataScope: DataScope.OWN,
          partnerId: 'partner-1',
        },
      }),
    );
    expect(state.user?.partnerId).toBe('partner-1');
    expect(state.isAuthenticated).toBe(true);
  });
});
