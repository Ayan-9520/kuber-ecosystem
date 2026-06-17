import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { API_MODULES, useApiEndpoints } from '@/lib/openapi';

export function ApiDocsHomePage() {
  const { endpoints, byModule } = useApiEndpoints();

  const modulesWithEndpoints = API_MODULES.filter((m) => (byModule.get(m.id)?.length ?? 0) > 0);

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>API Reference</h1>
        <p>
          Complete endpoint documentation generated from <code>openapi/kuberone-v1.yaml</code>.
          {' '}{endpoints.length} operations across {modulesWithEndpoints.length} modules.
        </p>
      </header>

      <div className="api-docs-grid">
        {modulesWithEndpoints.map((mod) => (
          <Link
            key={mod.id}
            to={`/developer-portal/api/reference/${mod.id}`}
            className="api-docs-card"
          >
            <BookOpen size={20} className="api-docs-card-icon" />
            <h3>{mod.name}</h3>
            <p>{mod.description}</p>
            <span className="api-docs-nav-count" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              {byModule.get(mod.id)?.length ?? 0} endpoints
            </span>
          </Link>
        ))}
      </div>

      <Link to="/developer-portal/api/reference" className="btn btn-primary">
        <Search size={16} /> Browse All Endpoints
      </Link>
    </div>
  );
}
