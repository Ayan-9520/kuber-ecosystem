import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDate, formatDateTime } from '@/lib/utils';
import { partnersService } from '@/services';

export function PartnersPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const queryClient = useQueryClient();

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
    queryKey: ['partners', params],
    queryFn: () => partnersService.list(params),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['partners', selectedId],
    queryFn: () => partnersService.getById(selectedId!),
    enabled: !!selectedId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'REJECTED' }) =>
      partnersService.update(id, { status }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      setActionMessage(
        vars.status === 'ACTIVE'
          ? 'Partner approved (ACTIVE). They can login with mobile / email / Partner Code + OTP.'
          : 'Partner rejected.',
      );
    },
    onError: (err: Error) => {
      setActionMessage(err.message || 'Could not update partner status.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      setSelectedId(null);
      setActionMessage(null);
    },
    onError: (err: Error) => {
      setActionMessage(err.message || 'Could not remove partner.');
    },
  });

  const columns = [
    { key: 'partnerCode', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'partnerCode') },
    {
      key: 'businessName',
      header: 'Business',
      render: (r: Record<string, unknown>) => fieldStr(r, 'businessName') || fieldStr(r, 'contactName'),
    },
    { key: 'phone', header: 'Phone', render: (r: Record<string, unknown>) => fieldStr(r, 'phone') },
    { key: 'email', header: 'Email', render: (r: Record<string, unknown>) => fieldStr(r, 'email') },
    {
      key: 'kycStatus',
      header: 'KYC',
      render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'kycStatus')} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (r: Record<string, unknown>) => formatDate(r.createdAt as string),
    },
  ];

  const partnerStatus = detail ? fieldStr(detail, 'status') : '';

  return (
    <div className="page-container">
      <PageHeader title="Partners" subtitle="Partner network, KYC status, and commission tiers" />

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search partners by name, code, or phone..."
        isLoading={isLoading}
        data={data?.items ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        onRowClick={(row) => {
          setActionMessage(null);
          setSelectedId(String(row.id));
        }}
        emptyTitle="No partners found"
        emptyDescription="Partners will appear here once onboarded to the network."
      />

      <DetailDrawer
        open={!!selectedId}
        title={detail ? fieldStr(detail, 'businessName') || fieldStr(detail, 'contactName') : 'Partner Details'}
        subtitle={detail ? fieldStr(detail, 'partnerCode') : undefined}
        onClose={() => {
          setSelectedId(null);
          setActionMessage(null);
        }}
      >
        {detailLoading ? (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        ) : detail ? (
          <>
            <div className="info-grid" style={{ marginBottom: '1.5rem' }}>
              <div>
                <div className="info-item-label">Contact</div>
                <div className="info-item-value">{fieldStr(detail, 'contactName')}</div>
              </div>
              <div>
                <div className="info-item-label">Phone</div>
                <div className="info-item-value">{fieldStr(detail, 'phone')}</div>
              </div>
              <div>
                <div className="info-item-label">Email</div>
                <div className="info-item-value">{fieldStr(detail, 'email')}</div>
              </div>
              <div>
                <div className="info-item-label">Commission Tier</div>
                <div className="info-item-value">{fieldStr(detail, 'commissionTier')}</div>
              </div>
              <div>
                <div className="info-item-label">KYC Status</div>
                <div className="info-item-value">
                  <StatusBadge status={fieldStr(detail, 'kycStatus')} />
                </div>
              </div>
              <div>
                <div className="info-item-label">Status</div>
                <div className="info-item-value">
                  <StatusBadge status={fieldStr(detail, 'status')} />
                </div>
              </div>
            </div>

            {actionMessage && (
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                {actionMessage}
              </p>
            )}

            {partnerStatus === 'PENDING' && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  disabled={statusMutation.isPending || deleteMutation.isPending}
                  onClick={() => selectedId && statusMutation.mutate({ id: selectedId, status: 'ACTIVE' })}
                >
                  {statusMutation.isPending ? 'Updating…' : 'Approve Partner'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={statusMutation.isPending || deleteMutation.isPending}
                  onClick={() => selectedId && statusMutation.mutate({ id: selectedId, status: 'REJECTED' })}
                >
                  Reject
                </Button>
              </div>
            )}

            {selectedId && fieldStr(detail, 'partnerCode') !== 'DSA-DEMO-001' ? (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={deleteMutation.isPending || statusMutation.isPending}
                  onClick={() => {
                    if (!selectedId) return;
                    const code = fieldStr(detail, 'partnerCode');
                    const ok = window.confirm(
                      `Remove partner ${code || selectedId}? They will leave the active network list (soft delete — real CRM style).`,
                    );
                    if (ok) deleteMutation.mutate(selectedId);
                  }}
                >
                  {deleteMutation.isPending ? 'Removing…' : 'Remove Partner'}
                </Button>
              </div>
            ) : null}

            {partnerStatus === 'ACTIVE' && (
              <Card title="Next step for partner">
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Login with registered mobile <strong>{fieldStr(detail, 'phone')}</strong>
                  {fieldStr(detail, 'email') ? (
                    <>
                      , email <strong>{fieldStr(detail, 'email')}</strong>
                    </>
                  ) : null}
                  , or Partner Code <strong>{fieldStr(detail, 'partnerCode')}</strong>.
                  <br />
                  OTP on Partner App (<code>localhost:8082</code>) or website <strong>/partner-login</strong>.
                  Dev OTP: <strong>123456</strong>.
                </p>
              </Card>
            )}

            <Card title="Timeline">
              <div className="info-grid">
                <div>
                  <div className="info-item-label">Created</div>
                  <div className="info-item-value">{formatDateTime(detail.createdAt as string)}</div>
                </div>
                <div>
                  <div className="info-item-label">Updated</div>
                  <div className="info-item-value">{formatDateTime(detail.updatedAt as string)}</div>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
