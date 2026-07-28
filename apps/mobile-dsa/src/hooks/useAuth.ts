import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { clearTokens, getRefreshToken, setTokens } from '@/lib/storage';
import { setMemoryAccessToken } from '@/lib/api';
import { authService, type MeUser } from '@/services/auth.service';
import type { RootState } from '@/store';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);

  const login = useCallback(
    async (accessToken: string, refreshToken: string, prefetchedMe?: MeUser) => {
      setMemoryAccessToken(accessToken);
      await setTokens(accessToken, refreshToken);
      const me = prefetchedMe ?? (await authService.me());

      if (me.userType !== 'PARTNER') {
        setMemoryAccessToken(null);
        await clearTokens();
        throw new Error('This app is for verified Financial Partners only');
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

      return me;
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
    setMemoryAccessToken(null);
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
