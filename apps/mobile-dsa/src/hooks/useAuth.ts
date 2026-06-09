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

      if (me.userType !== 'PARTNER') {
        await clearTokens();
        throw new Error('This app is for DSA partners only');
      }

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
            partnerId: me.partnerId ?? undefined,
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

  const isPartner = auth.user?.userType === 'PARTNER';

  return {
    ...auth,
    login,
    logout,
    partnerId: auth.user?.partnerId,
    userId: auth.user?.id,
    isPartner,
    permissions: auth.user?.permissions ?? [],
  };
}

export function useHasPermission(code: string): boolean {
  const { permissions } = useAuth();
  return permissions.includes(code) || permissions.includes('*');
}
