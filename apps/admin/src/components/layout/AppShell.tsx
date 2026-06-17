import { Outlet } from 'react-router-dom';

import { DeploymentWarningsBanner } from './DeploymentWarningsBanner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

import { ErrorBoundary } from '@/components/guards/ErrorBoundary';
import { useSessionExpiry } from '@/hooks';

export function AppShell() {
  const sessionExpired = useSessionExpiry();

  return (
    <div className="app-shell">
      {sessionExpired && <div className="session-expired-banner">Session expired. Redirecting to login...</div>}
      <Sidebar />
      <div className="main-area">
        <Topbar />
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
