import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { clearTokens, getAccessToken, getRefreshToken, isOnboardingDone } from '@/lib/storage';
import { authService } from '@/services';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const onboarding = await isOnboardingDone();
        if (mounted) setShowOnboarding(!onboarding);

        const token = await getAccessToken();
        const refresh = await getRefreshToken();
        if (!token || !refresh) return;

        const me = await authService.me();
        if (!mounted) return;

        dispatch(
          setCredentials({
            accessToken: token,
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
      } catch {
        await clearTokens();
        if (mounted) dispatch(clearCredentials());
      } finally {
        if (mounted) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return { ready, showOnboarding, setShowOnboarding };
}
