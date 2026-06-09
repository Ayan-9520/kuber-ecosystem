import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDate, formatDateTime } from '@/lib/utils';
import { partnersService } from '@/services';

export function PartnersPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

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
        onRowClick={(row) => setSelectedId(String(row.id))}
        emptyTitle="No partners found"
        emptyDescription="Partners will appear here once onboarded to the network."
      />

      <DetailDrawer
        open={!!selectedId}
        title={detail ? fieldStr(detail, 'businessName') || fieldStr(detail, 'contactName') : 'Partner Details'}
        subtitle={detail ? fieldStr(detail, 'partnerCode') : undefined}
        onClose={() => setSelectedId(null)}
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
