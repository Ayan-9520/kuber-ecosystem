import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { infrastructureService } from '@/services/infrastructure.service';

import '../infrastructure.css';

type TabId = 'dashboard' | 'environments' | 'services' | 'domains' | 'health' | 'deployment';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Infrastructure Dashboard' },
  { id: 'environments', label: 'Environment Dashboard' },
  { id: 'services', label: 'Services' },
  { id: 'domains', label: 'Domains & SSL' },
  { id: 'health', label: 'Health Dashboard' },
  { id: 'deployment', label: 'Deployment Dashboard' },
];

export function InfrastructureHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const overview = useQuery({
    queryKey: ['infrastructure', 'overview'],
    queryFn: () => infrastructureService.overview(),
    enabled: tab === 'dashboard',
  });

  const environments = useQuery({
    queryKey: ['infrastructure', 'environments', { page, limit }],
    queryFn: () => infrastructureService.environments({ page, limit }),
    enabled: tab === 'environments',
  });

  const services = useQuery({
    queryKey: ['infrastructure', 'services', { page, limit }],
    queryFn: () => infrastructureService.services({ page, limit }),
    enabled: tab === 'services',
  });

  const domains = useQuery({
    queryKey: ['infrastructure', 'domains', { page, limit }],
    queryFn: () => infrastructureService.domains({ page, limit }),
    enabled: tab === 'domains',
  });

  const health = useQuery({
    queryKey: ['infrastructure', 'health', { page, limit }],
    queryFn: () => infrastructureService.healthHistory({ page, limit, hours: 24 }),
    enabled: tab === 'health',
  });

  const deployment = useQuery({
    queryKey: ['infrastructure', 'deployment'],
    queryFn: () => infrastructureService.deployment(),
    enabled: tab === 'deployment',
  });

  const stats = useMemo(() => {
    const d = overview.data ?? {};
    const svc = (d.services ?? {}) as Record<string, number>;
    return {
      environments: (d.environments as number) ?? 0,
      servicesTotal: svc.total ?? 0,
      healthy: svc.healthy ?? 0,
      degraded: svc.degraded ?? 0,
      unhealthy: svc.unhealthy ?? 0,
      availability: (d.availabilityPercent as number) ?? 100,
      domains: (d.domains as number) ?? 0,
    };
  }, [overview.data]);

  const archLayers = useMemo(() => {
    const arch = (overview.data?.architecture ?? {}) as Record<string, unknown>;
    return (arch.layers as string[]) ?? [];
  }, [overview.data]);

  const envColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'type', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'type') },
    { key: 'region', header: 'Region', render: (r: Record<string, unknown>) => fieldStr(r, 'region') },
    { key: 'vpcCidr', header: 'VPC', render: (r: Record<string, unknown>) => fieldStr(r, 'vpcCidr') },
    { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => fieldStr(r, 'isActive') === 'true' ? 'Yes' : 'No' },
  ];

  const serviceColumns = [
    { key: 'name', header: 'Service', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'serviceType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'serviceType') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'replicas', header: 'Replicas', render: (r: Record<string, unknown>) => fieldStr(r, 'replicas') },
    { key: 'endpoint', header: 'Endpoint', render: (r: Record<string, unknown>) => fieldStr(r, 'endpoint') },
    { key: 'lastCheckedAt', header: 'Checked', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'lastCheckedAt')) },
  ];

  const domainColumns = [
    { key: 'hostname', header: 'Domain', render: (r: Record<string, unknown>) => fieldStr(r, 'hostname') },
    { key: 'serviceType', header: 'Service', render: (r: Record<string, unknown>) => fieldStr(r, 'serviceType') },
    { key: 'sslProvider', header: 'SSL', render: (r: Record<string, unknown>) => fieldStr(r, 'sslProvider') },
    { key: 'sslExpiresAt', header: 'Expires', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'sslExpiresAt')) },
    { key: 'hstsEnabled', header: 'HSTS', render: (r: Record<string, unknown>) => fieldStr(r, 'hstsEnabled') === 'true' ? 'Yes' : 'No' },
  ];

  const healthColumns = [
    { key: 'service', header: 'Service', render: (r: Record<string, unknown>) => fieldStr((r.service as Record<string, unknown>) ?? {}, 'name') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'latencyMs', header: 'Latency', render: (r: Record<string, unknown>) => `${fieldStr(r, 'latencyMs')}ms` },
    { key: 'cpuPercent', header: 'CPU', render: (r: Record<string, unknown>) => `${Number(r.cpuPercent ?? 0).toFixed(1)}%` },
    { key: 'checkedAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'checkedAt')) },
  ];

  if (overview.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="infrastructure-hub">
      <PageHeader
        title="Production Infrastructure"
        subtitle="AWS cloud infrastructure, environments, health, and deployment status for KuberOne"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="stat-grid mt-4">
            <StatCard label="Environments" value={String(stats.environments)} />
            <StatCard label="Services" value={String(stats.servicesTotal)} />
            <StatCard label="Availability" value={`${stats.availability}%`} />
            <StatCard label="Healthy" value={String(stats.healthy)} />
            <StatCard label="Degraded" value={String(stats.degraded)} />
            <StatCard label="Domains" value={String(stats.domains)} />
          </div>
          <Card title="Architecture Layers" className="mt-4">
            <div className="arch-layers">
              {archLayers.map((layer) => (
                <span key={layer} className="arch-layer">{layer}</span>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'environments' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={envColumns} data={environments.data?.items ?? []} meta={environments.data?.meta} isLoading={environments.isLoading} onPageChange={setPage} emptyTitle="No environments" />
      )}

      {tab === 'services' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={serviceColumns} data={services.data?.items ?? []} meta={services.data?.meta} isLoading={services.isLoading} onPageChange={setPage} emptyTitle="No services" />
      )}

      {tab === 'domains' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={domainColumns} data={domains.data?.items ?? []} meta={domains.data?.meta} isLoading={domains.isLoading} onPageChange={setPage} emptyTitle="No domains" />
      )}

      {tab === 'health' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={healthColumns} data={health.data?.items ?? []} meta={health.data?.meta} isLoading={health.isLoading} onPageChange={setPage} emptyTitle="No health snapshots" />
      )}

      {tab === 'deployment' && deployment.data && (
        <Card title="Production Deployment Status">
          <div className="stat-grid">
            <StatCard label="Environment" value={fieldStr((deployment.data.environment as Record<string, unknown>) ?? {}, 'code')} />
            <StatCard label="Region" value={fieldStr((deployment.data.environment as Record<string, unknown>) ?? {}, 'region')} />
            <StatCard label="Services" value={String((deployment.data.services as unknown[])?.length ?? 0)} />
          </div>
          <PaginatedListView
            search=""
            onSearchChange={() => {}}
            columns={serviceColumns}
            data={(deployment.data.services as Record<string, unknown>[]) ?? []}
            isLoading={false}
            onPageChange={() => {}}
            emptyTitle="No deployment services"
          />
        </Card>
      )}
    </div>
  );
}
