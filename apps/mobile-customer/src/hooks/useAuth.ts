import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { clearTokens, getRefreshToken, setTokens } from '@/lib/storage';
import { authService } from '@/services';
import type { RootState } from '@/store';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);

  const login = useCallback(
    async (accessToken: string, refreshToken: string) => {
      await setTokens(accessToken, refreshToken);
      const me = await authService.me();
      dispatch(
        setCredentials({
          accessToken,
          user: {
            id: me.id,
            sub: me.id,
            userType: me.userType as never,
            email: me.email ?? undefined,
            phone: me.phone ?? undefined,
            roles: me.roles,
            permissions: me.permissions,
            dataScope: me.dataScope as never,
            sessionId: '',
            customerId: me.customerId ?? undefined,
          },
        }),
      );
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        /* ignore */
      }
    }
    await clearTokens();
    dispatch(clearCredentials());
  }, [dispatch]);

  return { ...auth, login, logout, customerId: auth.user?.customerId };
}
