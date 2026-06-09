import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useDebounce, usePagination } from '@/hooks';
import { downloadBlob, fieldStr, formatDateTime } from '@/lib/utils';
import { auditService } from '@/services';

const ENTITY_TYPES = [
  { value: '', label: 'All entities' },
  { value: 'User', label: 'User' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Application', label: 'Application' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Document', label: 'Document' },
];

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'EXPORT', label: 'Export' },
];

export function AuditPage() {
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [debouncedSearch, entityType, action, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      entityType: entityType || undefined,
      action: action || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch, entityType, action],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.list(params),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      auditService.export({
        search: debouncedSearch || undefined,
        entityType: entityType || undefined,
        action: action || undefined,
      }),
    onSuccess: (blob) => downloadBlob(blob, `audit-logs-${Date.now()}.csv`),
  });

  const columns = [
    { key: 'action', header: 'Action', render: (r: Record<string, unknown>) => fieldStr(r, 'action') },
    { key: 'entityType', header: 'Entity', render: (r: Record<string, unknown>) => fieldStr(r, 'entityType') },
    { key: 'entityId', header: 'Entity ID', render: (r: Record<string, unknown>) => fieldStr(r, 'entityId') },
    { key: 'userId', header: 'User', render: (r: Record<string, unknown>) => fieldStr(r, 'userId') },
    { key: 'ipAddress', header: 'IP', render: (r: Record<string, unknown>) => fieldStr(r, 'ipAddress') },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable activity trail for compliance and security review"
        actions={
          <CanAccess permission="audit.export">
            <Button variant="secondary" loading={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
              Export CSV
            </Button>
          </CanAccess>
        }
      />

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit logs..."
        isLoading={isLoading}
        data={data?.items ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle="No audit logs found"
        emptyDescription="System activity will be recorded here as users perform actions."
        filters={
          <>
            <Select
              options={ENTITY_TYPES}
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              aria-label="Entity type filter"
            />
            <Select
              options={ACTIONS}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              aria-label="Action filter"
            />
          </>
        }
      />
    </div>
  );
}
