import { Outlet } from 'react-router-dom';


import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

import { useSessionExpiry } from '@/hooks';

export function AppShell() {
  const sessionExpired = useSessionExpiry();

  return (
    <div className="app-shell">
      {sessionExpired && <div className="session-expired-banner">Session expired. Redirecting to login...</div>}
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
