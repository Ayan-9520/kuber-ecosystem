import { Link, useParams } from 'react-router-dom';

import { MethodBadge } from '@/components/api-docs';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { API_MODULES, getModuleById, useApiEndpoints } from '@/lib/openapi';

export function ModuleEndpointsPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { byModule, isLoading } = useApiEndpoints();
  const mod = moduleId ? getModuleById(moduleId) : undefined;
  const endpoints = moduleId ? byModule.get(moduleId) ?? [] : [];

  if (isLoading) return <LoadingSpinner />;

  if (!mod) {
    return (
      <EmptyState
        title="Module not found"
        description={`Unknown module: ${moduleId}`}
        action={<Link to="/developer-portal/api/reference" className="btn btn-secondary">Back to reference</Link>}
      />
    );
  }

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>{mod.name}</h1>
        <p>{mod.description}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}
        </p>
      </header>

      {endpoints.length === 0 ? (
        <EmptyState title="No endpoints" description="This module has no indexed endpoints in the current OpenAPI spec." />
      ) : (
        <div className="api-endpoint-list">
          {endpoints.map((ep) => (
            <Link
              key={ep.id}
              to={`/developer-portal/api/reference/${moduleId}/endpoint/${encodeURIComponent(ep.id)}`}
              className="api-endpoint-row"
            >
              <MethodBadge method={ep.method} />
              <code className="api-endpoint-path">{ep.path}</code>
              <span className="api-endpoint-summary-text">{ep.summary}</span>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Related Modules</h3>
        <div className="api-docs-grid" style={{ marginTop: '0.75rem' }}>
          {API_MODULES.filter((m) => m.id !== moduleId && (byModule.get(m.id)?.length ?? 0) > 0)
            .slice(0, 6)
            .map((m) => (
              <Link key={m.id} to={`/developer-portal/api/reference/${m.id}`} className="api-docs-card">
                <h3>{m.name}</h3>
                <p>{byModule.get(m.id)?.length} endpoints</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
