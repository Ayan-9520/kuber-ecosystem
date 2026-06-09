import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { authService } from '@/services/auth.service';
import type { RootState } from '@/store';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);
  const [isLoading, setIsLoading] = useState(!auth.isAuthenticated && !!localStorage.getItem('accessToken'));

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (auth.isAuthenticated) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((user) => {
        dispatch(
          setCredentials({
            accessToken: token,
            user: {
              id: user.id,
              sub: user.id,
              userType: user.userType as never,
              email: user.email ?? undefined,
              phone: user.phone ?? undefined,
              roles: user.roles,
              permissions: user.permissions,
              dataScope: user.dataScope as never,
              sessionId: '',
              branchId: user.branchId,
              regionId: user.regionId,
              employeeId: user.employeeId,
              customerId: user.customerId,
              partnerId: user.partnerId,
            },
          }),
        );
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch(clearCredentials());
      })
      .finally(() => setIsLoading(false));
  }, [auth.isAuthenticated, dispatch]);

  return { isAuthenticated: auth.isAuthenticated, isLoading, user: auth.user };
}
