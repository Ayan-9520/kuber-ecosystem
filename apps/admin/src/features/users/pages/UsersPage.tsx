import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { usersService } from '@/services';

type TabId = 'users' | 'roles' | 'permissions' | 'matrix';

const TABS: { id: TabId; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'matrix', label: 'Role Matrix' },
];

export function UsersPage() {
  const [tab, setTab] = useState<TabId>('users');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch],
  );

  const fetcher = useMemo(() => {
    switch (tab) {
      case 'users':
        return usersService.list;
      case 'roles':
        return usersService.roles;
      case 'permissions':
        return usersService.permissions;
      case 'matrix':
        return usersService.rolePermissions;
      default:
        return usersService.list;
    }
  }, [tab]);

  const { data, isLoading } = useQuery({
    queryKey: ['users-rbac', tab, params],
    queryFn: () => fetcher(params),
  });

  const columns = useMemo(() => {
    switch (tab) {
      case 'users':
        return [
          { key: 'email', header: 'Email', render: (r: Record<string, unknown>) => fieldStr(r, 'email') || fieldStr(r, 'phone') },
          { key: 'userType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'userType') },
          {
            key: 'status',
            header: 'Status',
            render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} />,
          },
          {
            key: 'lastLoginAt',
            header: 'Last Login',
            render: (r: Record<string, unknown>) => formatDateTime(r.lastLoginAt as string),
          },
        ];
      case 'roles':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'description', header: 'Description', render: (r: Record<string, unknown>) => fieldStr(r, 'description') },
          {
            key: 'isActive',
            header: 'Status',
            render: (r: Record<string, unknown>) => (
              <StatusBadge status={r.isActive === false ? 'CLOSED' : 'APPROVED'} />
            ),
          },
        ];
      case 'permissions':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'module', header: 'Module', render: (r: Record<string, unknown>) => fieldStr(r, 'module') },
          { key: 'action', header: 'Action', render: (r: Record<string, unknown>) => fieldStr(r, 'action') },
        ];
      case 'matrix':
        return [
          { key: 'roleId', header: 'Role', render: (r: Record<string, unknown>) => fieldStr(r, 'roleId') },
          { key: 'permissionId', header: 'Permission', render: (r: Record<string, unknown>) => fieldStr(r, 'permissionId') },
          {
            key: 'createdAt',
            header: 'Granted',
            render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string),
          },
        ];
      default:
        return [];
    }
  }, [tab]);

  const emptyTitles: Record<TabId, string> = {
    users: 'No users found',
    roles: 'No roles configured',
    permissions: 'No permissions found',
    matrix: 'No role-permission mappings',
  };

  return (
    <div className="page-container">
      <PageHeader title="Users & RBAC" subtitle="User accounts, roles, permissions, and access matrix" />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'matrix' && (data?.items?.length ?? 0) > 0 && (
        <Card title="Role Matrix Summary" className="detail-section">
          <p className="page-subtitle">
            {data?.meta.total ?? 0} role-permission mappings across the platform
          </p>
        </Card>
      )}

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${tab}...`}
        isLoading={isLoading}
        data={data?.items ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle={emptyTitles[tab]}
        emptyDescription="User and access control records will appear here."
      />
    </div>
  );
}
