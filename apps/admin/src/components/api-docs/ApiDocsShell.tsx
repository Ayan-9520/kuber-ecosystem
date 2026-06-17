import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { ApiDocsNav } from './ApiDocsNav';
import { ApiDocsSearch } from './ApiDocsSearch';

import { useApiEndpoints } from '@/lib/openapi';
import { trackDocEvent } from '@/lib/openapi/analytics';


export function ApiDocsShell() {
  const location = useLocation();
  const { endpoints, byModule, isLoading } = useApiEndpoints();

  const endpointCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [modId, eps] of byModule) {
      counts.set(modId, eps.length);
    }
    return counts;
  }, [byModule]);

  useEffect(() => {
    trackDocEvent('page_view', location.pathname);
    document.title = `API Docs · KuberOne`;
  }, [location.pathname]);

  return (
    <div className="api-docs-shell">
      <aside className="api-docs-sidebar">
        <div className="api-docs-sidebar-header">
          <h2>Developer Portal</h2>
          <p>KuberOne API v1.0</p>
        </div>
        {!isLoading ? (
          <div className="api-docs-sidebar-search">
            <ApiDocsSearch endpoints={endpoints} />
          </div>
        ) : null}
        <ApiDocsNav endpointCounts={endpointCounts} />
      </aside>
      <main className="api-docs-main">
        <Outlet />
      </main>
    </div>
  );
}
