import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDate, formatDateTime } from '@/lib/utils';
import { partnersService } from '@/services';

type CommissionTier = 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

const TIER_COLORS: Record<CommissionTier, { bg: string; color: string; label: string }> = {
  SILVER: { bg: '#e5e7eb', color: '#374151', label: 'Silver' },
  GOLD: { bg: '#fef3c7', color: '#92400e', label: 'Gold' },
  PLATINUM: { bg: '#dbeafe', color: '#1e40af', label: 'Platinum' },
  DIAMOND: { bg: '#ede9fe', color: '#6d28d9', label: 'Diamond' },
};

function TierBadge({ tier }: { tier: string }) {
  const config = TIER_COLORS[tier as CommissionTier] ?? TIER_COLORS.SILVER;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.15rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

export function PartnersPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('');
  const [overrideTier, setOverrideTier] = useState<CommissionTier | ''>('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    reset();
  }, [debouncedSearch, tierFilter, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      commissionTier: tierFilter || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch, tierFilter],
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
    mutationFn: ({
      id,
      status,
      kycStatus,
    }: {
      id: string;
      status: 'ACTIVE' | 'REJECTED';
      kycStatus?: 'VERIFIED' | 'REJECTED';
    }) => partnersService.update(id, { status, ...(kycStatus ? { kycStatus } : {}) }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      setActionMessage(
        vars.status === 'ACTIVE'
          ? vars.kycStatus === 'VERIFIED'
            ? 'Partner approved + KYC verified. They can login and skip the KYC wall; public profile can go live.'
            : 'Partner approved (ACTIVE). They can login with mobile / email / Partner Code + OTP.'
          : 'Partner rejected.',
      );
    },
    onError: (err: Error) => {
      setActionMessage(err.message || 'Could not update partner status.');
    },
  });

  const kycMutation = useMutation({
    mutationFn: ({ id, kycStatus }: { id: string; kycStatus: 'VERIFIED' | 'REJECTED' | 'IN_PROGRESS' }) =>
      partnersService.update(id, { kycStatus }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      setActionMessage(
        vars.kycStatus === 'VERIFIED'
          ? 'KYC verified. Partner can use full app and publish public profile.'
          : `KYC set to ${vars.kycStatus}.`,
      );
    },
    onError: (err: Error) => {
      setActionMessage(err.message || 'Could not update KYC status.');
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

  const tierMutation = useMutation({
    mutationFn: ({ id, commissionTier }: { id: string; commissionTier: CommissionTier }) =>
      partnersService.update(id, { commissionTier }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      setActionMessage(`Tier updated to ${TIER_COLORS[vars.commissionTier].label}.`);
      setOverrideTier('');
    },
    onError: (err: Error) => {
      setActionMessage(err.message || 'Could not update tier.');
    },
  });

  const allPartners = data?.items ?? [];
  const tierCounts = useMemo(() => {
    const counts = { total: data?.meta?.total ?? 0, SILVER: 0, GOLD: 0, PLATINUM: 0, DIAMOND: 0 };
    for (const p of allPartners) {
      const t = fieldStr(p, 'commissionTier') as CommissionTier;
      if (t in counts) counts[t]++;
    }
    return counts;
  }, [allPartners, data?.meta?.total]);

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
      key: 'commissionTier',
      header: 'Tier',
      render: (r: Record<string, unknown>) => <TierBadge tier={fieldStr(r, 'commissionTier') || 'SILVER'} />,
    },
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Partners" value={tierCounts.total} />
        <StatCard label="Silver" value={tierCounts.SILVER} />
        <StatCard label="Gold" value={tierCounts.GOLD} />
        <StatCard label="Platinum+" value={tierCounts.PLATINUM + tierCounts.DIAMOND} />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tier:</label>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-border, #d1d5db)',
            fontSize: '0.875rem',
            background: 'var(--color-bg-primary, #fff)',
            color: 'var(--color-text-primary, #111)',
          }}
        >
          <option value="">All Tiers</option>
          <option value="SILVER">Silver</option>
          <option value="GOLD">Gold</option>
          <option value="PLATINUM">Platinum</option>
          <option value="DIAMOND">Diamond</option>
        </select>
      </div>

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

            <div style={{ marginBottom: '1.5rem' }}>
            <Card title="Commission Tier">
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>Current:</span>
                <TierBadge tier={fieldStr(detail, 'commissionTier') || 'SILVER'} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                <strong>Tier thresholds:</strong><br />
                Gold: ₹1L revenue or 50 leads<br />
                Platinum: ₹5L revenue or 200 leads<br />
                Diamond: ₹25L revenue or 1,000 leads
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value as CommissionTier | '')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--color-border, #d1d5db)',
                    fontSize: '0.875rem',
                    background: 'var(--color-bg-primary, #fff)',
                    color: 'var(--color-text-primary, #111)',
                  }}
                >
                  <option value="">Override tier…</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="DIAMOND">Diamond</option>
                </select>
                <Button
                  type="button"
                  disabled={!overrideTier || tierMutation.isPending}
                  onClick={() => {
                    if (selectedId && overrideTier) {
                      tierMutation.mutate({ id: selectedId, commissionTier: overrideTier });
                    }
                  }}
                >
                  {tierMutation.isPending ? 'Updating…' : 'Update Tier'}
                </Button>
              </div>
            </Card>
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
                  disabled={statusMutation.isPending || deleteMutation.isPending || kycMutation.isPending}
                  onClick={() =>
                    selectedId &&
                    statusMutation.mutate({ id: selectedId, status: 'ACTIVE', kycStatus: 'VERIFIED' })
                  }
                >
                  {statusMutation.isPending ? 'Updating…' : 'Approve Partner + KYC'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={statusMutation.isPending || deleteMutation.isPending || kycMutation.isPending}
                  onClick={() => selectedId && statusMutation.mutate({ id: selectedId, status: 'REJECTED' })}
                >
                  Reject
                </Button>
              </div>
            )}

            {partnerStatus === 'ACTIVE' && fieldStr(detail, 'kycStatus') !== 'VERIFIED' ? (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <p style={{ width: '100%', fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Partner can login, but KYC screen still shows until verified.
                </p>
                <Button
                  type="button"
                  disabled={kycMutation.isPending || statusMutation.isPending || deleteMutation.isPending}
                  onClick={() => selectedId && kycMutation.mutate({ id: selectedId, kycStatus: 'VERIFIED' })}
                >
                  {kycMutation.isPending ? 'Verifying…' : 'Approve KYC'}
                </Button>
              </div>
            ) : null}

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
