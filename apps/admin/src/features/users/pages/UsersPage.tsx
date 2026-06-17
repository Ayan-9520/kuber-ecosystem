import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, Input, PageHeader, Select, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { usersService } from '@/services';

type TabId = 'users' | 'roles' | 'permissions' | 'matrix';
type DrawerMode = 'create' | 'edit' | null;

const TABS: { id: TabId; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'matrix', label: 'Role Matrix' },
];

const USER_TYPE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'CUSTOMER', label: 'Customer' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'LOCKED', label: 'Locked' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const EMPTY_FORM = { email: '', phone: '', password: '', userType: 'EMPLOYEE', status: 'ACTIVE' };

export function UsersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('users');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const { data: userDetail } = useQuery({
    queryKey: ['users', selectedId],
    queryFn: () => usersService.getById(selectedId!),
    enabled: !!selectedId && drawerMode === 'edit',
  });

  useEffect(() => {
    if (userDetail && drawerMode === 'edit') {
      setForm({
        email: fieldStr(userDetail, 'email'),
        phone: fieldStr(userDetail, 'phone'),
        password: '',
        userType: fieldStr(userDetail, 'userType') || 'EMPLOYEE',
        status: fieldStr(userDetail, 'status') || 'ACTIVE',
      });
    }
  }, [userDetail, drawerMode]);

  const saveMutation = useMutation({
    mutationFn: () =>
      drawerMode === 'edit' && selectedId
        ? usersService.update(selectedId, {
            email: form.email || undefined,
            phone: form.phone || undefined,
            password: form.password || undefined,
            status: form.status,
          })
        : usersService.create({
            email: form.email || undefined,
            phone: form.phone || undefined,
            password: form.password || undefined,
            userType: form.userType,
            status: form.status,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-rbac'] });
      setDrawerMode(null);
      setSelectedId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-rbac'] });
      setDrawerMode(null);
      setSelectedId(null);
    },
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
          {
            key: 'actions',
            header: 'Actions',
            render: (r: Record<string, unknown>) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(String(r.id));
                    setDrawerMode('edit');
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this user?')) deleteMutation.mutate(String(r.id));
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
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
  }, [tab, deleteMutation]);

  const emptyTitles: Record<TabId, string> = {
    users: 'No users found',
    roles: 'No roles configured',
    permissions: 'No permissions found',
    matrix: 'No role-permission mappings',
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Users & RBAC"
        subtitle="User accounts, roles, permissions, and access matrix"
        actions={
          tab === 'users' ? (
            <Button
              variant="primary"
              onClick={() => {
                setDrawerMode('create');
                setSelectedId(null);
                setForm(EMPTY_FORM);
              }}
            >
              Create User
            </Button>
          ) : undefined
        }
      />

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

      <DetailDrawer
        open={drawerMode !== null}
        title={drawerMode === 'edit' ? 'Edit User' : 'Create User'}
        onClose={() => {
          setDrawerMode(null);
          setSelectedId(null);
          setForm(EMPTY_FORM);
        }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="primary"
              disabled={(!form.email && !form.phone) || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setDrawerMode(null)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            label={drawerMode === 'edit' ? 'New Password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {drawerMode === 'create' && (
            <Select
              label="User Type"
              options={USER_TYPE_OPTIONS}
              value={form.userType}
              onChange={(e) => setForm({ ...form, userType: e.target.value })}
            />
          )}
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </div>
      </DetailDrawer>
    </div>
  );
}
