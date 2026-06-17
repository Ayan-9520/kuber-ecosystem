import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { EndpointDetailView } from '@/components/api-docs';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { getModuleById, useApiEndpoints, useOpenApiSpec } from '@/lib/openapi';
import { trackDocEvent } from '@/lib/openapi/analytics';

export function EndpointPage() {
  const { moduleId, endpointId } = useParams<{
    moduleId: string;
    endpointId: string;
  }>();
  const decodedId = endpointId ? decodeURIComponent(endpointId) : '';
  const { endpoints, isLoading } = useApiEndpoints();
  const { data: spec } = useOpenApiSpec();

  const endpoint = endpoints.find((ep) => ep.id === decodedId);
  const mod = moduleId ? getModuleById(moduleId) : undefined;

  useEffect(() => {
    if (endpoint) {
      trackDocEvent('endpoint_view', endpoint.id, `${endpoint.method} ${endpoint.path}`);
    }
  }, [endpoint]);

  if (isLoading) return <LoadingSpinner />;

  if (!endpoint) {
    return (
      <EmptyState
        title="Endpoint not found"
        description={decodedId}
        action={<Link to={`/developer-portal/api/reference/${moduleId ?? ''}`} className="btn btn-secondary">Back to module</Link>}
      />
    );
  }

  return (
    <div className="api-docs-page">
      <nav style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
        <Link to="/developer-portal/api/reference" style={{ color: 'var(--color-text-muted)' }}>Reference</Link>
        {' / '}
        <Link to={`/developer-portal/api/reference/${moduleId}`} style={{ color: 'var(--color-text-muted)' }}>{mod?.name}</Link>
        {' / '}
        <span>{endpoint.method.toUpperCase()} {endpoint.path}</span>
      </nav>
      <EndpointDetailView endpoint={endpoint} spec={spec} />
    </div>
  );
}
