import {
  BookOpen,
  Braces,
  Code2,
  Download,
  FileCode2,
  KeyRound,
  Layers,
  Rocket,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ArchitectureDiagram } from '@/components/api-docs';
import { useApiEndpoints, useOpenApiSpec } from '@/lib/openapi';

const QUICK_LINKS = [
  { to: '/developer-portal/api/guides/authentication', icon: KeyRound, title: 'Authentication', desc: 'JWT, OTP, refresh tokens' },
  { to: '/developer-portal/api/reference', icon: BookOpen, title: 'API Reference', desc: 'Browse all endpoints' },
  { to: '/developer-portal/api/swagger', icon: Code2, title: 'Swagger UI', desc: 'Try APIs interactively' },
  { to: '/developer-portal/api/guides/sdk', icon: Braces, title: 'SDK Examples', desc: 'Code samples' },
  { to: '/developer-portal/api/guides/postman', icon: FileCode2, title: 'Postman', desc: 'Import collection' },
  { to: '/developer-portal/api/guides/errors', icon: Shield, title: 'Error Catalog', desc: 'HTTP errors & recovery' },
];

export function DeveloperPortalHomePage() {
  const { data: spec } = useOpenApiSpec();
  const { endpoints } = useApiEndpoints();
  const endpointCount = endpoints.length;

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>KuberOne API Documentation</h1>
        <p>
          Enterprise-grade API platform for Kuber Finserve. {endpointCount} endpoints across CRM, LOS,
          communications, AI, analytics, and governance modules.
        </p>
      </header>

      <section className="api-docs-grid">
        {QUICK_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="api-docs-card">
            <link.icon size={22} className="api-docs-card-icon" />
            <h3>{link.title}</h3>
            <p>{link.desc}</p>
          </Link>
        ))}
      </section>

      <section>
        <h2>Version &amp; Environments</h2>
        <table className="data-table api-env-table">
          <thead>
            <tr>
              <th>Environment</th>
              <th>Base URL</th>
              <th>API Version</th>
            </tr>
          </thead>
          <tbody>
            {(spec?.servers ?? [
              { url: 'http://localhost:4000/api/v1', description: 'Development' },
              { url: 'https://api.kuberone.kuberfinserve.com/api/v1', description: 'Production' },
            ]).map((s) => (
              <tr key={s.url}>
                <td>{s.description ?? 'Server'}</td>
                <td><code>{s.url}</code></td>
                <td>{spec?.info.version ?? '1.0.0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Architecture</h2>
        <ArchitectureDiagram />
      </section>

      <section className="api-quick-start">
        <h2><Rocket size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />Quick Start</h2>
        <ol style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          <li>Authenticate via <Link to="/developer-portal/api/guides/authentication">JWT or OTP</Link></li>
          <li>Include <code>Authorization: Bearer &lt;token&gt;</code> on protected requests</li>
          <li>Browse the <Link to="/developer-portal/api/reference">API Reference</Link> or use <Link to="/developer-portal/api/swagger">Swagger UI</Link></li>
          <li>Import the <Link to="/developer-portal/api/guides/postman">Postman collection</Link> for team testing</li>
          <li>Review <Link to="/developer-portal/api/guides/rbac">RBAC permissions</Link> for your integration role</li>
        </ol>
      </section>

      <section>
        <h2>Downloads</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/openapi/kuberone-v1.yaml" download className="btn btn-secondary">
            <Download size={16} /> OpenAPI YAML
          </a>
          <a href="/postman/KuberOne.postman_collection.json" download className="btn btn-secondary">
            <Download size={16} /> Postman Collection
          </a>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2><Layers size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />Authentication Overview</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '70ch' }}>
          KuberOne uses JWT Bearer tokens with refresh rotation for employees and partners.
          Mobile customers and DSA agents authenticate via phone OTP.
          All protected endpoints enforce RBAC permissions and data scope (branch/region/organization).
        </p>
        <Link to="/developer-portal/api/guides/authentication" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Read Authentication Guide
        </Link>
      </section>
    </div>
  );
}
