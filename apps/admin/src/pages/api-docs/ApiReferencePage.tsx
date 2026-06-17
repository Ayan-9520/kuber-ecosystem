import { Link } from 'react-router-dom';

import { MethodBadge } from '@/components/api-docs';
import { LoadingSpinner } from '@/components/ui';
import { API_MODULES, useApiEndpoints } from '@/lib/openapi';

export function ApiReferencePage() {
  const { endpoints, isLoading } = useApiEndpoints();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>All Endpoints</h1>
        <p>{endpoints.length} API operations indexed from OpenAPI 3.1 specification.</p>
      </header>

      <div className="api-endpoint-list">
        {endpoints.map((ep) => {
          const mod = API_MODULES.find((m) => m.id === ep.moduleId);
          return (
            <Link
              key={ep.id}
              to={`/developer-portal/api/reference/${ep.moduleId}/endpoint/${encodeURIComponent(ep.id)}`}
              className="api-endpoint-row"
            >
              <MethodBadge method={ep.method} />
              <code className="api-endpoint-path">{ep.path}</code>
              <span className="api-endpoint-summary-text">{ep.summary ?? mod?.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
