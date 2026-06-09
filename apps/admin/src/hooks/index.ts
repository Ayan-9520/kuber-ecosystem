import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/usePermissions';
import { setSessionExpiredHandler } from '@/lib/api';

export function useSessionExpiry() {
  const [expired, setExpired] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setExpired(true);
      logout();
      setTimeout(() => {
        navigate('/login', { replace: true, state: { sessionExpired: true } });
      }, 2000);
    });
  }, [logout, navigate]);

  return expired;
}

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  return { page, limit, setPage, reset: () => setPage(1) };
}
