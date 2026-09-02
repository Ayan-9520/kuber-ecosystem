import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailModal } from '@/components/common/DetailModal';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDate, formatDateTime } from '@/lib/utils';
import { partnersService, documentsService } from '@/services';

import styles from './PartnersPage.module.css';

type CommissionTier = 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
type ActionTone = 'success' | 'info' | 'warn';

const TIER_COLORS: Record<CommissionTier, { bg: string; color: string; label: string }> = {
  SILVER: { bg: '#e5e7eb', color: '#374151', label: 'Silver' },
  GOLD: { bg: '#fef3c7', color: '#92400e', label: 'Gold' },
  PLATINUM: { bg: '#dbeafe', color: '#1e40af', label: 'Platinum' },
  DIAMOND: { bg: '#ede9fe', color: '#6d28d9', label: 'Diamond' },
};

const PARTNER_LOGIN_URL = 'https://partner.kuberone.online/login';
const PARTNER_KYC_REQUIRED = ['PAN', 'AADHAAR', 'CHEQUE'] as const;

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

function actionAlertClass(tone: ActionTone): string {
  if (tone === 'success') return styles.alertSuccess ?? '';
  if (tone === 'warn') return styles.alertWarn ?? '';
  return styles.alertInfo ?? '';
}

export function PartnersPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<ActionTone>('info');
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

  const { data: partnerDocs } = useQuery({
    queryKey: ['partner-kyc-docs', selectedId],
    queryFn: () =>
      documentsService.list({
        partnerId: selectedId!,
        ownerType: 'PARTNER',
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!selectedId,
  });

  const showMessage = (message: string, tone: ActionTone = 'info') => {
    setActionMessage(message);
    setActionTone(tone);
  };

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
      if (vars.status === 'REJECTED') {
        showMessage('Partner application rejected. They cannot log in.', 'warn');
        return;
      }
      if (vars.kycStatus === 'VERIFIED') {
        showMessage(
          'Partner approved and KYC marked verified. Approval email sent — full app access without KYC wall.',
          'success',
        );
        return;
      }
      showMessage(
        'Partner approved. Approval email sent — they can log in and upload KYC documents in the Partner App.',
        'success',
      );
    },
    onError: (err: Error) => {
      showMessage(err.message || 'Could not update partner status.', 'warn');
    },
  });

  const kycMutation = useMutation({
    mutationFn: ({
      id,
      kycStatus,
    }: {
      id: string;
      kycStatus: 'VERIFIED' | 'REJECTED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'SUBMITTED';
    }) => partnersService.update(id, { kycStatus }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      void queryClient.invalidateQueries({ queryKey: ['partner-kyc-docs', vars.id] });
      if (vars.kycStatus === 'VERIFIED') {
        showMessage(
          'KYC verified. Partner gets full access and can publish their public profile.',
          'success',
        );
        return;
      }
      if (vars.kycStatus === 'NOT_STARTED') {
        showMessage('KYC reset. Partner must upload documents again before re-verification.', 'info');
        return;
      }
      showMessage(
        `KYC status updated to ${vars.kycStatus.replace(/_/g, ' ').toLowerCase()}.`,
        vars.kycStatus === 'REJECTED' ? 'warn' : 'info',
      );
    },
    onError: (err: Error) => {
      showMessage(err.message || 'Could not update KYC status.', 'warn');
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
      showMessage(err.message || 'Could not remove partner.', 'warn');
    },
  });

  const tierMutation = useMutation({
    mutationFn: ({ id, commissionTier }: { id: string; commissionTier: CommissionTier }) =>
      partnersService.update(id, { commissionTier }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['partners'] });
      showMessage(`Commission tier updated to ${TIER_COLORS[vars.commissionTier].label}.`, 'success');
      setOverrideTier('');
    },
    onError: (err: Error) => {
      showMessage(err.message || 'Could not update tier.', 'warn');
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
  const kycStatus = detail ? fieldStr(detail, 'kycStatus') : '';
  const uploadedKycCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const doc of partnerDocs?.items ?? []) {
      const code = fieldStr(doc, 'documentTypeCode') || fieldStr(doc, 'documentTypeName');
      if (code) codes.add(code.toUpperCase());
    }
    return codes;
  }, [partnerDocs?.items]);
  const missingKycTypes = PARTNER_KYC_REQUIRED.filter((code) => !uploadedKycCodes.has(code));
  const kycDocCount = partnerDocs?.meta.total ?? partnerDocs?.items.length ?? 0;
  const canVerifyKyc = kycDocCount > 0 && missingKycTypes.length === 0;
  const isBusy =
    statusMutation.isPending || deleteMutation.isPending || kycMutation.isPending || tierMutation.isPending;

  const approvePartner = (withKyc: boolean) => {
    if (!selectedId || !detail) return;
    const name = fieldStr(detail, 'contactName') || fieldStr(detail, 'businessName');
    const code = fieldStr(detail, 'partnerCode');
    const msg = withKyc
      ? `Fast-track approve ${name} (${code})?\n\nThey will get login access AND KYC will be marked verified without document review. Use only for trusted partners.`
      : `Approve ${name} (${code})?\n\nThey can log in via OTP and must upload KYC documents in the Partner App. You verify KYC after reviewing Documents.`;
    if (!window.confirm(msg)) return;
    statusMutation.mutate({
      id: selectedId,
      status: 'ACTIVE',
      ...(withKyc ? { kycStatus: 'VERIFIED' as const } : {}),
    });
  };

  const rejectPartner = () => {
    if (!selectedId || !detail) return;
    const name = fieldStr(detail, 'contactName') || fieldStr(detail, 'businessName');
    if (!window.confirm(`Reject application for ${name}? They will not be able to log in.`)) return;
    statusMutation.mutate({ id: selectedId, status: 'REJECTED' });
  };

  const verifyKyc = () => {
    if (!selectedId || !detail) return;
    const name = fieldStr(detail, 'contactName') || fieldStr(detail, 'businessName');
    if (missingKycTypes.length > 0) {
      showMessage(`Cannot verify yet — missing: ${missingKycTypes.join(', ')}`, 'warn');
      return;
    }
    if (
      !window.confirm(
        `Mark KYC as verified for ${name}?\n\nConfirm you have reviewed PAN, Aadhaar and cheque in Documents.`,
      )
    )
      return;
    kycMutation.mutate({ id: selectedId, kycStatus: 'VERIFIED' });
  };

  const resetKyc = () => {
    if (!selectedId || !detail) return;
    const name = fieldStr(detail, 'contactName') || fieldStr(detail, 'businessName');
    if (
      !window.confirm(
        `Reset KYC for ${name} to "not started"?\n\nThey will need to upload documents again and you must re-verify after review.`,
      )
    )
      return;
    kycMutation.mutate({ id: selectedId, kycStatus: 'NOT_STARTED' });
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Partners"
        subtitle="Review applications, approve login access, and verify KYC after document review"
      />

      <div className={styles.statsRow}>
        <StatCard label="Total Partners" value={tierCounts.total} />
        <StatCard label="Silver (this page)" value={tierCounts.SILVER} />
        <StatCard label="Gold (this page)" value={tierCounts.GOLD} />
        <StatCard label="Platinum+ (this page)" value={tierCounts.PLATINUM + tierCounts.DIAMOND} />
      </div>

      <div className={styles.filters}>
        <span className={styles.filterLabel}>Tier filter</span>
        <select
          className={styles.filterSelect}
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="">All tiers</option>
          <option value="SILVER">Silver</option>
          <option value="GOLD">Gold</option>
          <option value="PLATINUM">Platinum</option>
          <option value="DIAMOND">Diamond</option>
        </select>
      </div>

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, code, phone, or email…"
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
        emptyDescription="Partner applications from the website will appear here after sync."
      />

      <DetailModal
        open={!!selectedId}
        size="lg"
        title={detail ? fieldStr(detail, 'businessName') || fieldStr(detail, 'contactName') : 'Partner review'}
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
            {actionMessage ? (
              <div className={actionAlertClass(actionTone)} role="status">
                {actionMessage}
              </div>
            ) : null}

            <div className={styles.statusHero}>
              <div className={styles.statusHeroItem}>
                <div className={styles.statusHeroLabel}>Account</div>
                <StatusBadge status={partnerStatus || 'PENDING'} />
              </div>
              <div className={styles.statusHeroItem}>
                <div className={styles.statusHeroLabel}>KYC</div>
                <StatusBadge status={kycStatus || 'NOT_STARTED'} />
              </div>
              <div className={styles.statusHeroItem}>
                <div className={styles.statusHeroLabel}>Tier</div>
                <TierBadge tier={fieldStr(detail, 'commissionTier') || 'SILVER'} />
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div>
                <div className={styles.infoLabel}>Contact</div>
                <div className={styles.infoValue}>{fieldStr(detail, 'contactName')}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>Phone</div>
                <div className={styles.infoValue}>{fieldStr(detail, 'phone')}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoValue}>{fieldStr(detail, 'email')}</div>
              </div>
              <div>
                <div className={styles.infoLabel}>Partner type</div>
                <div className={styles.infoValue}>{fieldStr(detail, 'partnerType') || 'DSA'}</div>
              </div>
            </div>

            {partnerStatus === 'PENDING' ? (
              <div className={styles.actionBlock}>
                <h3 className={styles.actionTitle}>Application review</h3>
                <p className={styles.actionHint}>
                  <strong>Real CRM flow:</strong> first approve login access. Partner uploads PAN / agreement in the
                  Partner App → you review under <strong>Documents</strong> → then verify KYC. Approval email is sent
                  automatically.
                </p>
                <div className={styles.actionRow}>
                  <Button type="button" disabled={isBusy} onClick={() => approvePartner(false)}>
                    {statusMutation.isPending ? 'Processing…' : 'Approve partner'}
                  </Button>
                  <Button type="button" variant="secondary" disabled={isBusy} onClick={rejectPartner}>
                    Reject
                  </Button>
                </div>
                <p className={styles.actionHint} style={{ marginBottom: 0, marginTop: '0.75rem' }}>
                  Trusted / demo partner only:{' '}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => approvePartner(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      font: 'inherit',
                    }}
                  >
                    Fast-track approve + verify KYC
                  </button>
                </p>
              </div>
            ) : null}

            {partnerStatus === 'ACTIVE' ? (
              <div className={styles.actionBlock}>
                <h3 className={styles.actionTitle}>KYC documents</h3>
                <p className={styles.actionHint}>
                  Real flow: partner uploads PAN, Aadhaar, cheque (+ agreement) in the Partner App → you review
                  here → then verify KYC.
                </p>
                <div className={styles.infoGrid}>
                  <div>
                    <div className={styles.infoLabel}>Uploaded</div>
                    <div className={styles.infoValue}>{kycDocCount} file(s)</div>
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Missing required</div>
                    <div className={styles.infoValue}>
                      {missingKycTypes.length ? missingKycTypes.join(', ') : 'None — ready to verify'}
                    </div>
                  </div>
                </div>
                {(partnerDocs?.items.length ?? 0) > 0 ? (
                  <ul className={styles.actionHint} style={{ marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
                    {partnerDocs?.items.map((doc) => (
                      <li key={String(doc.id)}>
                        {fieldStr(doc, 'documentTypeName') || fieldStr(doc, 'fileName')} —{' '}
                        {fieldStr(doc, 'status')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.actionHint}>No documents uploaded yet.</p>
                )}
                <div className={styles.actionRow}>
                  {kycStatus !== 'VERIFIED' ? (
                    <Button type="button" disabled={isBusy || !canVerifyKyc} onClick={verifyKyc}>
                      {kycMutation.isPending ? 'Verifying…' : 'Verify KYC'}
                    </Button>
                  ) : null}
                  {kycStatus === 'VERIFIED' || kycDocCount === 0 ? (
                    <Button type="button" variant="secondary" disabled={isBusy} onClick={resetKyc}>
                      Reset KYC
                    </Button>
                  ) : null}
                </div>
                {kycStatus !== 'VERIFIED' && !canVerifyKyc ? (
                  <p className={styles.actionHint} style={{ marginBottom: 0 }}>
                    Verify KYC unlocks after partner uploads PAN, Aadhaar and cancelled cheque.
                  </p>
                ) : null}
              </div>
            ) : null}

            {partnerStatus === 'ACTIVE' && kycStatus === 'VERIFIED' && kycDocCount === 0 ? (
              <div className={`${styles.section} ${styles.alertWarn}`}>
                <p className={styles.actionHint} style={{ margin: 0 }}>
                  KYC is marked verified but no documents are on file. Click <strong>Reset KYC</strong> so the
                  partner can upload and you can run the real review flow.
                </p>
              </div>
            ) : null}

            {partnerStatus === 'ACTIVE' ? (
              <div className={`${styles.section} ${styles.alertInfo}`}>
                <p className={styles.loginCard}>
                  Partner login:{' '}
                  <a className={styles.loginLink} href={PARTNER_LOGIN_URL} target="_blank" rel="noreferrer">
                    partner.kuberone.online
                  </a>{' '}
                  or kuberfinserve.com/partner-login
                  <br />
                  Use mobile <strong>{fieldStr(detail, 'phone')}</strong>
                  {fieldStr(detail, 'email') ? (
                    <>
                      , email <strong>{fieldStr(detail, 'email')}</strong>
                    </>
                  ) : null}
                  , or code <strong>{fieldStr(detail, 'partnerCode')}</strong> — OTP via SMS / email.
                </p>
              </div>
            ) : null}

            <div className={styles.section}>
              <Card title="Commission tier">
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>Current:</span>
                  <TierBadge tier={fieldStr(detail, 'commissionTier') || 'SILVER'} />
                </div>
                <p className={styles.tierMeta}>
                  Auto-upgrade thresholds: Gold ₹1L / 50 leads · Platinum ₹5L / 200 leads · Diamond ₹25L / 1,000 leads
                </p>
                <div className={styles.tierRow}>
                  <select
                    className={styles.filterSelect}
                    value={overrideTier}
                    onChange={(e) => setOverrideTier(e.target.value as CommissionTier | '')}
                  >
                    <option value="">Override tier…</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="DIAMOND">Diamond</option>
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!overrideTier || tierMutation.isPending}
                    onClick={() => {
                      if (selectedId && overrideTier) {
                        tierMutation.mutate({ id: selectedId, commissionTier: overrideTier });
                      }
                    }}
                  >
                    {tierMutation.isPending ? 'Updating…' : 'Update tier'}
                  </Button>
                </div>
              </Card>
            </div>

            {selectedId && fieldStr(detail, 'partnerCode') !== 'DSA-DEMO-001' ? (
              <div className={styles.actionRow}>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => {
                    if (!selectedId) return;
                    const code = fieldStr(detail, 'partnerCode');
                    if (
                      !window.confirm(
                        `Remove partner ${code || selectedId} from the active network? (Soft delete — record kept for audit.)`,
                      )
                    )
                      return;
                    deleteMutation.mutate(selectedId);
                  }}
                >
                  {deleteMutation.isPending ? 'Removing…' : 'Remove partner'}
                </Button>
              </div>
            ) : null}

            <Card title="Timeline">
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.infoLabel}>Applied</div>
                  <div className={styles.infoValue}>{formatDateTime(detail.createdAt as string)}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Last updated</div>
                  <div className={styles.infoValue}>{formatDateTime(detail.updatedAt as string)}</div>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </DetailModal>
    </div>
  );
}
