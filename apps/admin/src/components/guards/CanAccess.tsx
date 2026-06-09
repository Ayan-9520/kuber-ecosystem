import type { ReactNode } from 'react';

import { usePermissions } from '@/hooks/usePermissions';

export function CanAccess({
  permission,
  children,
  fallback = null,
}: {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  if (!hasPermission(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
