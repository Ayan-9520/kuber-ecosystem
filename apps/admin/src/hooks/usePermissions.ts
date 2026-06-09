import type { AuthenticatedUser } from '@kuberone/shared-types';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '@/store';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

export function usePermissions() {
  const user = useSelector((s: RootState) => s.auth.user);

  const hasPermission = useCallback(
    (permission: string | string[]) => {
      if (!user) return false;
      if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN')) return true;
      const perms = Array.isArray(permission) ? permission : [permission];
      return perms.some((p) => user.permissions.includes(p));
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => hasPermission(permissions),
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]) => {
      if (!user) return false;
      if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN')) return true;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user],
  );

  return { user, hasPermission, hasAnyPermission, hasAllPermissions };
}

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(clearCredentials());
  }, [dispatch]);

  return { ...auth, logout, setCredentials: (payload: { user: AuthenticatedUser; accessToken: string }) => dispatch(setCredentials(payload)) };
}
