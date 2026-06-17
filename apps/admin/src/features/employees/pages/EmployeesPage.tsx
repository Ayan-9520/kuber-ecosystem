import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, Input, PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDate } from '@/lib/utils';
import { branchesService, employeesService } from '@/services';

type DrawerMode = 'create' | 'edit' | null;

const EMPTY_FORM = {
  userId: '',
  branchId: '',
  employeeCode: '',
  firstName: '',
  lastName: '',
  designation: '',
  department: '',
};

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    reset();
  }, [debouncedSearch, reset]);

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

  const { data, isLoading } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesService.list(params),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches-options'],
    queryFn: () => branchesService.list({ page: 1, limit: 100 }),
  });

  const { data: detail } = useQuery({
    queryKey: ['employees', selectedId],
    queryFn: () => employeesService.getById(selectedId!),
    enabled: !!selectedId && drawerMode === 'edit',
  });

  useEffect(() => {
    if (detail && drawerMode === 'edit') {
      setForm({
        userId: fieldStr(detail, 'userId'),
        branchId: fieldStr(detail, 'branchId'),
        employeeCode: fieldStr(detail, 'employeeCode'),
        firstName: fieldStr(detail, 'firstName'),
        lastName: fieldStr(detail, 'lastName'),
        designation: fieldStr(detail, 'designation'),
        department: fieldStr(detail, 'department'),
      });
    }
  }, [detail, drawerMode]);

  const saveMutation = useMutation({
    mutationFn: () =>
      drawerMode === 'edit' && selectedId
        ? employeesService.update(selectedId, {
            branchId: form.branchId,
            employeeCode: form.employeeCode,
            firstName: form.firstName,
            lastName: form.lastName,
            designation: form.designation || undefined,
            department: form.department || undefined,
          })
        : employeesService.create({
            userId: form.userId,
            branchId: form.branchId,
            employeeCode: form.employeeCode,
            firstName: form.firstName,
            lastName: form.lastName,
            designation: form.designation || undefined,
            department: form.department || undefined,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDrawerMode(null);
      setSelectedId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDrawerMode(null);
      setSelectedId(null);
    },
  });

  const branchName = (branchId: string) => {
    const branch = branches?.items?.find((b) => String(b.id) === branchId);
    return branch ? fieldStr(branch, 'name') : branchId;
  };

  const columns = [
    { key: 'employeeCode', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'employeeCode') },
    {
      key: 'name',
      header: 'Name',
      render: (r: Record<string, unknown>) => `${fieldStr(r, 'firstName')} ${fieldStr(r, 'lastName')}`.trim(),
    },
    { key: 'designation', header: 'Designation', render: (r: Record<string, unknown>) => fieldStr(r, 'designation') },
    { key: 'branchId', header: 'Branch', render: (r: Record<string, unknown>) => branchName(fieldStr(r, 'branchId')) },
    {
      key: 'isActive',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive === false ? 'CLOSED' : 'APPROVED'} />,
    },
    { key: 'joinedAt', header: 'Joined', render: (r: Record<string, unknown>) => formatDate(r.joinedAt as string) },
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
              if (confirm('Delete this employee?')) deleteMutation.mutate(String(r.id));
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Employees"
        subtitle="Manage employee records and branch assignments"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setDrawerMode('create');
              setSelectedId(null);
              setForm(EMPTY_FORM);
            }}
          >
            Add Employee
          </Button>
        }
      />

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by code, name, or designation..."
        isLoading={isLoading}
        data={data?.items ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle="No employees found"
        emptyDescription="Employee records will appear here once onboarded."
      />

      <DetailDrawer
        open={drawerMode !== null}
        title={drawerMode === 'edit' ? 'Edit Employee' : 'Create Employee'}
        onClose={() => {
          setDrawerMode(null);
          setSelectedId(null);
          setForm(EMPTY_FORM);
        }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="primary"
              disabled={!form.employeeCode || !form.firstName || !form.branchId || saveMutation.isPending}
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
          {drawerMode === 'create' && (
            <Input label="User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
          )}
          <Input label="Employee Code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Branch ID" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} />
          <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </div>
      </DetailDrawer>
    </div>
  );
}
