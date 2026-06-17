import type { RbacEndpointRule } from '../types.js';

/**
 * Core API RBAC matrix — used by automated RBAC security tests.
 * Extend as new modules ship; tests verify auth middleware coverage.
 */
export const RBAC_ENDPOINT_MATRIX: RbacEndpointRule[] = [
  { method: 'GET', path: '/auth/me', module: 'auth', requiredAuth: true },
  { method: 'POST', path: '/auth/logout', module: 'auth', requiredAuth: true },
  { method: 'POST', path: '/auth/logout-all', module: 'auth', requiredAuth: true },
  { method: 'GET', path: '/users', module: 'users', requiredAuth: true, requiredPermissions: ['users.read'] },
  { method: 'GET', path: '/leads', module: 'leads', requiredAuth: true, requiredPermissions: ['leads.read'], dataScope: 'BRANCH' },
  { method: 'POST', path: '/leads', module: 'leads', requiredAuth: true, requiredPermissions: ['leads.write'] },
  { method: 'GET', path: '/customers', module: 'customers', requiredAuth: true, requiredPermissions: ['customers.read'] },
  { method: 'GET', path: '/applications', module: 'applications', requiredAuth: true, requiredPermissions: ['applications.read'] },
  { method: 'GET', path: '/documents', module: 'documents', requiredAuth: true, requiredPermissions: ['documents.read'] },
  { method: 'POST', path: '/documents', module: 'documents', requiredAuth: true, requiredPermissions: ['documents.write'] },
  { method: 'GET', path: '/partners', module: 'partners', requiredAuth: true, requiredPermissions: ['partners.read'] },
  { method: 'GET', path: '/campaigns', module: 'campaigns', requiredAuth: true, requiredPermissions: ['notifications.read'] },
  { method: 'GET', path: '/automation/workflows', module: 'automation', requiredAuth: true, requiredPermissions: ['automation.read'] },
  { method: 'GET', path: '/content/templates', module: 'content', requiredAuth: true, requiredPermissions: ['content.read'] },
  { method: 'GET', path: '/audit/events', module: 'governance', requiredAuth: true, requiredPermissions: ['audit.read'] },
  { method: 'GET', path: '/compliance/dashboard', module: 'governance', requiredAuth: true, requiredPermissions: ['compliance.read'] },
  { method: 'GET', path: '/ai/models', module: 'ai-platform', requiredAuth: true, requiredPermissions: ['ai.read'] },
  { method: 'POST', path: '/ai/chat', module: 'ai-platform', requiredAuth: true, requiredPermissions: ['ai.read'] },
  { method: 'GET', path: '/analytics/dashboard', module: 'analytics', requiredAuth: true, requiredPermissions: ['analytics.read'] },
  { method: 'GET', path: '/settings', module: 'settings', requiredAuth: true, requiredPermissions: ['settings.read'] },
];

export function getRbacCoverage(testedPaths: string[]): { total: number; tested: number; percent: number } {
  const total = RBAC_ENDPOINT_MATRIX.length;
  const tested = RBAC_ENDPOINT_MATRIX.filter((r) =>
    testedPaths.some((p) => p.includes(r.path)),
  ).length;
  return { total, tested, percent: Math.round((tested / total) * 1000) / 10 };
}
