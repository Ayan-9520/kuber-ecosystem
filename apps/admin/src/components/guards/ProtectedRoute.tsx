import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingSpinner } from '@/components/ui';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthBootstrap();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
