import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { DeploymentWarningsBanner } from './DeploymentWarningsBanner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

import { ErrorBoundary } from '@/components/guards/ErrorBoundary';
import { useSessionExpiry } from '@/hooks';

export function AppShell() {
  const sessionExpired = useSessionExpiry();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.classList.remove('sidebar-drawer-open');
      return;
    }

    document.body.classList.add('sidebar-drawer-open');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('sidebar-drawer-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="app-shell">
      {sessionExpired && <div className="session-expired-banner">Session expired. Redirecting to login...</div>}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}
      <Sidebar open={sidebarOpen} onNavigate={closeSidebar} />
      <div className="main-area">
        <Topbar onMenuToggle={toggleSidebar} />
        <DeploymentWarningsBanner />
        <main className="main-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
