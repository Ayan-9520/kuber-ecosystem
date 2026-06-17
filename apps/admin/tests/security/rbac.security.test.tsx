import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CRM_PROTECTED_ROUTES, CRM_ROUTE_PERMISSIONS } from '@kuberone/security-testing';

import { PermissionRoute } from '@/components/guards/PermissionRoute';
import { renderWithProviders } from '../utils/render';

const mockHasPermission = vi.fn();

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    user: { id: '1', permissions: ['leads.read'] },
    hasPermission: mockHasPermission,
  }),
}));

describe('Security — CRM RBAC', () => {
  it('defines permission map for all protected CRM routes', () => {
    expect(CRM_PROTECTED_ROUTES.length).toBeGreaterThan(20);
    expect(CRM_ROUTE_PERMISSIONS.leads).toContain('leads.read');
    expect(CRM_ROUTE_PERMISSIONS.governance).toContain('audit.read');
  });

  it('denies access when user lacks required permissions', () => {
    mockHasPermission.mockReturnValue(false);
    renderWithProviders(
      <PermissionRoute permissions={['users.write']}>
        <div>Restricted Users Admin</div>
      </PermissionRoute>,
    );
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByText('Restricted Users Admin')).not.toBeInTheDocument();
  });

  it('allows access when user has required permissions', () => {
    mockHasPermission.mockReturnValue(true);
    renderWithProviders(
      <PermissionRoute permissions={['leads.read']}>
        <div>Leads Dashboard</div>
      </PermissionRoute>,
    );
    expect(screen.getByText('Leads Dashboard')).toBeInTheDocument();
  });

  it('governance route requires elevated permissions in matrix', () => {
    const perms = CRM_ROUTE_PERMISSIONS.governance ?? [];
    expect(perms).toContain('security.read');
    expect(perms).toContain('compliance.read');
  });

  it('ai-platform route requires ai.manage in permission set', () => {
    expect(CRM_ROUTE_PERMISSIONS['ai-platform']).toContain('ai.manage');
  });
});
