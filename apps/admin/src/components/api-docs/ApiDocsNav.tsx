import {
  BookOpen,
  Braces,
  Code2,
  FileCode2,
  FlaskConical,
  Home,
  KeyRound,
  Layers,
  Search,
  Shield,
  Workflow,
  Zap,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { API_MODULES } from '@/lib/openapi';

const GUIDE_LINKS = [
  { to: '/developer-portal/api/guides/authentication', label: 'Authentication', icon: KeyRound },
  { to: '/developer-portal/api/guides/errors', label: 'Error Catalog', icon: Shield },
  { to: '/developer-portal/api/guides/rbac', label: 'RBAC Guide', icon: Shield },
  { to: '/developer-portal/api/guides/pagination', label: 'Pagination', icon: Layers },
  { to: '/developer-portal/api/guides/rate-limits', label: 'Rate Limits', icon: Zap },
  { to: '/developer-portal/api/guides/webhooks', label: 'Webhooks', icon: Workflow },
  { to: '/developer-portal/api/guides/workflows', label: 'Workflows', icon: Workflow },
  { to: '/developer-portal/api/guides/ai-platform', label: 'AI Platform', icon: Code2 },
  { to: '/developer-portal/api/guides/sdk', label: 'SDK Examples', icon: Braces },
  { to: '/developer-portal/api/guides/postman', label: 'Postman', icon: FileCode2 },
  { to: '/developer-portal/api/guides/testing', label: 'API Testing', icon: FlaskConical },
];

const TOOL_LINKS = [
  { to: '/developer-portal/api/swagger', label: 'Swagger UI' },
  { to: '/developer-portal/api/redoc', label: 'Redoc UI' },
  { to: '/developer-portal/api/openapi', label: 'OpenAPI Spec' },
  { to: '/developer-portal/api/analytics', label: 'Doc Analytics' },
];

interface ApiDocsNavProps {
  endpointCounts?: Map<string, number>;
}

export function ApiDocsNav({ endpointCounts }: ApiDocsNavProps) {
  return (
    <nav className="api-docs-nav" aria-label="API documentation">
      <div className="api-docs-nav-section">
        <NavLink to="/developer-portal" end className={({ isActive }) => `api-docs-nav-link${isActive ? ' active' : ''}`}>
          <Home size={16} />
          Overview
        </NavLink>
        <NavLink to="/developer-portal/api" end className={({ isActive }) => `api-docs-nav-link${isActive ? ' active' : ''}`}>
          <BookOpen size={16} />
          API Docs Home
        </NavLink>
        <NavLink to="/developer-portal/api/reference" end className={({ isActive }) => `api-docs-nav-link${isActive ? ' active' : ''}`}>
          <Search size={16} />
          API Reference
        </NavLink>
      </div>

      <div className="api-docs-nav-heading">Guides</div>
      <div className="api-docs-nav-section">
        {GUIDE_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `api-docs-nav-link${isActive ? ' active' : ''}`}>
            <link.icon size={16} />
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="api-docs-nav-heading">Tools</div>
      <div className="api-docs-nav-section">
        {TOOL_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `api-docs-nav-link${isActive ? ' active' : ''}`}>
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="api-docs-nav-heading">Modules</div>
      <div className="api-docs-nav-section api-docs-nav-modules">
        {API_MODULES.map((mod) => {
          const count = endpointCounts?.get(mod.id) ?? 0;
          if (count === 0) return null;
          return (
            <NavLink
              key={mod.id}
              to={`/developer-portal/api/reference/${mod.id}`}
              className={({ isActive }) => `api-docs-nav-link api-docs-nav-module${isActive ? ' active' : ''}`}
            >
              <span>{mod.name}</span>
              <span className="api-docs-nav-count">{count}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
