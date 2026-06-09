import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { TicketFiltersBar } from '@/features/support/components/TicketFiltersBar';
import { PRIORITY_LABELS, STATUS_LABELS, type TicketFilters } from '@/features/support/constants';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { usersService } from '@/services';
import { supportService } from '@/services/support.service';

type TabId = 'dashboard' | 'tickets' | 'assignments' | 'escalations' | 'sla' | 'analytics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'escalations', label: 'Escalations' },
  { id: 'sla', label: 'SLA' },
  { id: 'analytics', label: 'Analytics' },
];

function exportCsv(rows: Record<string, unknown>[]) {
  const headers = ['ticketNumber', 'subject', 'status', 'priority', 'createdAt'];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `support-tickets-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SupportHubPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, filters, reset]);

  const ticketParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filters,
    }),
    [page, limit, debouncedSearch, filters],
  );

  const analytics = useQuery({
    queryKey: ['ticket-analytics'],
    queryFn: () => supportService.analytics(),
  });

  const tickets = useQuery({
    queryKey: ['support', 'tickets', ticketParams],
    queryFn: () => supportService.tickets(ticketParams),
    enabled: tab === 'tickets' || tab === 'dashboard' || tab === 'sla',
  });

  const assignments = useQuery({
    queryKey: ['support', 'assignments', page, limit],
    queryFn: () => supportService.assignments({ page, limit, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: tab === 'assignments',
  });

  const escalations = useQuery({
    queryKey: ['support', 'escalations', page, limit],
    queryFn: () => supportService.escalations({ page, limit, sortBy: 'escalatedAt', sortOrder: 'desc' }),
    enabled: tab === 'escalations',
  });

  const categories = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: () => supportService.categories({ limit: 50, isActive: true }),
  });

  const users = useQuery({
    queryKey: ['users-support'],
    queryFn: () => usersService.list({ page: 1, limit: 100 }),
  });

  const bulkClose = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => supportService.closeTicket(id, {})));
    },
    onSuccess: () => {
      setSelected(new Set());
      void queryClient.invalidateQueries({ queryKey: ['support'] });
    },
  });

  const slaTickets = useMemo(
    () => (tickets.data?.items ?? []).filter((t) => t.slaBreached || t.responseSlaDueAt || t.resolutionSlaDueAt),
    [tickets.data?.items],
  );

  const summary = analytics.data ?? {};

  return (
    <div className="page-container support-hub">
      <PageHeader
        title="Support Center"
        subtitle="Ticket management, SLA tracking, escalations, and agent performance"
        actions={
          <CanAccess permission="tickets.write">
            <Button onClick={() => navigate('/support/tickets/new')}>Create Ticket</Button>
          </CanAccess>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="stat-grid">
            <StatCard label="Open Tickets" value={fieldStr(summary, 'openTickets')} />
            <StatCard label="Resolved" value={fieldStr(summary, 'resolvedTickets')} />
            <StatCard label="Closed" value={fieldStr(summary, 'closedTickets')} />
            <StatCard label="SLA Breaches" value={fieldStr(summary, 'slaBreaches')} />
            <StatCard label="Avg Resolution (hrs)" value={fieldStr(summary, 'avgResolutionHours')} />
          </div>
          <Card title="Recent Tickets">
            {tickets.isLoading ? (
              <div className="skeleton skeleton-stat" />
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tickets.data?.items ?? []).slice(0, 8).map((row) => (
                      <tr key={String(row.id)} className="clickable" onClick={() => navigate(`/support/tickets/${row.id}`)}>
                        <td>{fieldStr(row, 'ticketNumber')} — {fieldStr(row, 'subject')}</td>
                        <td><StatusBadge status={fieldStr(row, 'priority')} /></td>
                        <td><StatusBadge status={fieldStr(row, 'status')} /></td>
                        <td>{formatDateTime(row.createdAt as string)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === 'tickets' && (
        <>
          <TicketFiltersBar
            filters={filters}
            onChange={setFilters}
            categories={categories.data?.items ?? []}
            users={users.data?.items ?? []}
            onExport={() => exportCsv(tickets.data?.items ?? [])}
          />
          {selected.size > 0 && (
            <div className="support-bulk-bar">
              <span>{selected.size} selected</span>
              <CanAccess permission="tickets.resolve">
                <Button size="sm" variant="danger" loading={bulkClose.isPending} onClick={() => bulkClose.mutate([...selected])}>
                  Bulk Close
                </Button>
              </CanAccess>
            </div>
          )}
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search tickets..."
            isLoading={tickets.isLoading}
            isError={tickets.isError}
            onRetry={() => void tickets.refetch()}
            data={tickets.data?.items ?? []}
            meta={tickets.data?.meta}
            onPageChange={setPage}
            columns={[
              {
                key: 'select',
                header: '',
                render: (r) => (
                  <input
                    type="checkbox"
                    checked={selected.has(String(r.id))}
                    onChange={(e) => {
                      e.stopPropagation();
                      const next = new Set(selected);
                      if (e.target.checked) next.add(String(r.id));
                      else next.delete(String(r.id));
                      setSelected(next);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ),
              },
              { key: 'ticketNumber', header: 'Ticket #', render: (r) => fieldStr(r, 'ticketNumber') },
              { key: 'subject', header: 'Subject', render: (r) => fieldStr(r, 'subject') },
              { key: 'priority', header: 'Priority', render: (r) => PRIORITY_LABELS[fieldStr(r, 'priority')] ?? fieldStr(r, 'priority') },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={fieldStr(r, 'status')} /> },
              { key: 'category', header: 'Category', render: (r) => fieldStr((r.category as Record<string, unknown>) ?? {}, 'name') },
              { key: 'assigned', header: 'Assigned', render: (r) => fieldStr(r, 'assignedUserId').slice(0, 8) || '—' },
              { key: 'sla', header: 'SLA', render: (r) => (r.slaBreached ? 'Breached' : 'OK') },
              { key: 'createdAt', header: 'Created', render: (r) => formatDateTime(r.createdAt as string) },
            ]}
            onRowClick={(row) => navigate(`/support/tickets/${row.id}`)}
            emptyTitle="No support tickets"
            emptyDescription="Tickets from customers and partners will appear here."
          />
        </>
      )}

      {tab === 'assignments' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search assignments..."
          isLoading={assignments.isLoading}
          data={assignments.data?.items ?? []}
          meta={assignments.data?.meta}
          onPageChange={setPage}
          columns={[
            { key: 'ticketId', header: 'Ticket', render: (r) => fieldStr(r, 'ticketId') },
            { key: 'type', header: 'Type', render: (r) => fieldStr(r, 'assignmentType') },
            { key: 'user', header: 'User', render: (r) => fieldStr(r, 'assignedUserId') },
            { key: 'at', header: 'Assigned', render: (r) => formatDateTime(r.createdAt as string) },
          ]}
          emptyTitle="No assignments"
          emptyDescription="Ticket assignments will appear here."
        />
      )}

      {tab === 'escalations' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search escalations..."
          isLoading={escalations.isLoading}
          data={escalations.data?.items ?? []}
          meta={escalations.data?.meta}
          onPageChange={setPage}
          columns={[
            { key: 'ticketId', header: 'Ticket', render: (r) => fieldStr(r, 'ticketId') },
            { key: 'from', header: 'From', render: (r) => fieldStr(r, 'fromLevel') },
            { key: 'to', header: 'To', render: (r) => fieldStr(r, 'toLevel') },
            { key: 'at', header: 'Escalated', render: (r) => formatDateTime(r.escalatedAt as string) },
          ]}
          onRowClick={(row) => navigate(`/support/tickets/${row.ticketId}`)}
          emptyTitle="No escalations"
          emptyDescription="Escalated tickets will appear here."
        />
      )}

      {tab === 'sla' && (
        <Card title="SLA Dashboard">
          <div className="stat-grid">
            <StatCard label="SLA Breaches" value={fieldStr(summary, 'slaBreaches')} />
            <StatCard label="Open (at risk)" value={String(slaTickets.filter((t) => !t.slaBreached).length)} />
            <StatCard label="Breached (visible)" value={String(slaTickets.filter((t) => t.slaBreached).length)} />
          </div>
          <div className="data-table-wrapper mt-md">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Priority</th>
                  <th>Response Due</th>
                  <th>Resolution Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slaTickets.map((t) => (
                  <tr key={String(t.id)} className="clickable" onClick={() => navigate(`/support/tickets/${t.id}`)}>
                    <td>{fieldStr(t, 'ticketNumber')}</td>
                    <td>{fieldStr(t, 'priority')}</td>
                    <td>{formatDateTime(t.responseSlaDueAt as string)}</td>
                    <td>{formatDateTime(t.resolutionSlaDueAt as string)}</td>
                    <td>{t.slaBreached ? 'Breached' : STATUS_LABELS[fieldStr(t, 'status')] ?? fieldStr(t, 'status')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'analytics' && (
        <>
          <div className="stat-grid">
            <StatCard label="Open" value={fieldStr(summary, 'openTickets')} />
            <StatCard label="Resolved" value={fieldStr(summary, 'resolvedTickets')} />
            <StatCard label="Closed" value={fieldStr(summary, 'closedTickets')} />
            <StatCard label="SLA Breaches" value={fieldStr(summary, 'slaBreaches')} />
          </div>
          <div className="detail-grid">
            <Card title="By Status">
              <ul className="simple-list">
                {Object.entries((summary.byStatus as Record<string, number>) ?? {}).map(([k, v]) => (
                  <li key={k}>{STATUS_LABELS[k] ?? k}: {v}</li>
                ))}
              </ul>
            </Card>
            <Card title="By Priority">
              <ul className="simple-list">
                {Object.entries((summary.byPriority as Record<string, number>) ?? {}).map(([k, v]) => (
                  <li key={k}>{PRIORITY_LABELS[k] ?? k}: {v}</li>
                ))}
              </ul>
            </Card>
          </div>
          <Card title="Agent Performance">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Total</th>
                    <th>Resolved</th>
                    <th>Avg Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {((summary.executivePerformance as Array<Record<string, unknown>>) ?? []).map((row) => (
                    <tr key={String(row.assignedUserId)}>
                      <td>{fieldStr(row, 'assignedUserName')}</td>
                      <td>{fieldStr(row, 'total')}</td>
                      <td>{fieldStr(row, 'resolved')}</td>
                      <td>{fieldStr(row, 'avgResolutionHours')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
