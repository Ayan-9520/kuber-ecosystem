import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList,
  FileText,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  ChartPanel,
  DataTable,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from '@/components/ui';
import { CHART_COLORS, CHART_GRID, CHART_TICK, CHART_TOOLTIP } from '@/lib/chart-theme';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { dashboardService } from '@/services/index';

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return str(obj.name ?? obj.code ?? obj.label ?? obj.title);
  }
  return String(v);
}

function documentTypeLabel(row: Record<string, unknown>): string {
  const dt = row.documentType;
  if (dt && typeof dt === 'object') {
    const typed = dt as Record<string, unknown>;
    return str(typed.name ?? typed.code);
  }
  return str(row.documentTypeName ?? row.type);
}

function customerLabel(row: Record<string, unknown>): string {
  const customer = row.customer;
  if (customer && typeof customer === 'object') {
    return str((customer as Record<string, unknown>).fullName ?? (customer as Record<string, unknown>).customerCode);
  }
  return str(row.customerName ?? row.customerId);
}

export function DashboardPage() {
  const navigate = useNavigate();

  const leadAnalytics = useQuery({
    queryKey: ['dashboard', 'leadAnalytics'],
    queryFn: () => dashboardService.leadAnalytics(),
    refetchOnMount: 'always',
  });

  const commissionAnalytics = useQuery({
    queryKey: ['dashboard', 'commissionAnalytics'],
    queryFn: () => dashboardService.commissionAnalytics(),
    refetchOnMount: 'always',
  });

  const recentLeads = useQuery({
    queryKey: ['dashboard', 'recentLeads'],
    queryFn: () => dashboardService.recentLeads(),
    refetchOnMount: 'always',
  });

  const recentApplications = useQuery({
    queryKey: ['dashboard', 'recentApplications'],
    queryFn: () => dashboardService.recentApplications(),
    refetchOnMount: 'always',
  });

  const pendingDocuments = useQuery({
    queryKey: ['dashboard', 'pendingDocuments'],
    queryFn: () => dashboardService.pendingDocuments(),
    refetchOnMount: 'always',
  });

  const recommendationAnalytics = useQuery({
    queryKey: ['dashboard', 'recommendationAnalytics'],
    queryFn: () => dashboardService.recommendationAnalytics(),
  });

  const isLoading = leadAnalytics.isLoading || commissionAnalytics.isLoading;

  if (isLoading) return <LoadingSpinner />;

  const hasCriticalError = leadAnalytics.isError || commissionAnalytics.isError;

  if (hasCriticalError) {
    const errorDetail =
      leadAnalytics.error instanceof Error
        ? leadAnalytics.error.message
        : commissionAnalytics.error instanceof Error
          ? commissionAnalytics.error.message
          : 'Some metrics could not be loaded. Check API connection.';
    return (
      <div className="page-container">
        <PageHeader title="Dashboard" subtitle="Real-time overview of leads, applications, and commissions" />
        <EmptyState
          title="Failed to load dashboard"
          description={errorDetail.includes('Network') || errorDetail.includes('ECONNREFUSED')
            ? 'Backend API is not reachable. Start it with: pnpm dev:backend'
            : errorDetail}
          action={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                void leadAnalytics.refetch();
                void commissionAnalytics.refetch();
                void recentLeads.refetch();
                void recentApplications.refetch();
                void pendingDocuments.refetch();
                void recommendationAnalytics.refetch();
              }}
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  const leads = leadAnalytics.data;
  const commissions = commissionAnalytics.data;

  if (!leads || !commissions) {
    return (
      <div className="page-container">
        <EmptyState title="Failed to load dashboard metrics" />
      </div>
    );
  }

  const statusData = Object.entries(leads.byStatus).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  const branchData = leads.branchPerformance.map((b) => ({
    name: b.branchName ?? '—',
    total: b.totalLeads,
    converted: b.converted,
  }));

  const executiveData = leads.executivePerformance.map((e) => ({
    name: (e.employeeName ?? '—').split(' ')[0],
    total: e.totalLeads,
    converted: e.converted,
  }));

  const recentApplicationItems = (recentApplications.data?.items ?? []).filter(
    (item) => !item.deletedAt && !item.leadIsDeleted,
  );
  const recentLeadItems = (recentLeads.data?.items ?? []).filter((item) => !item.deletedAt);
  const linkedLeadIds = new Set(
    recentApplicationItems.map((item) => item.leadId).filter(Boolean).map(String),
  );

  const activities = [
    ...recentLeadItems
      .filter((item) => !linkedLeadIds.has(String(item.id)))
      .map((item) => ({
        id: `lead-${item.id}`,
        type: 'Lead',
        title: `${str(item.fullName ?? item.prospectName ?? item.name)} · ${str(item.leadNumber)}`,
        status: str(item.status),
        time: str(item.updatedAt ?? item.createdAt),
        path: `/leads/${item.id}`,
      })),
    ...recentApplicationItems.map((item) => ({
      id: `app-${item.id}`,
      type: 'Application',
      title: `${str(item.customerName ?? (item.customer as Record<string, unknown> | undefined)?.fullName)} · ${str(item.applicationNumber ?? item.id)}`,
      status: str(item.status),
      time: str(item.updatedAt ?? item.submittedAt ?? item.createdAt),
      path: `/applications/${item.id}`,
    })),
  ]
    .filter((item) => item.time && item.time !== '—')
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of leads, applications, and commissions"
      />

      <div className="stat-grid">
        <StatCard
          label="Today's Leads"
          value={leads.todayLeads}
          icon={<Target size={20} />}
          onClick={() => navigate('/leads?preset=today')}
        />
        <StatCard
          label="Qualified Leads"
          value={leads.qualifiedLeads}
          icon={<Users size={20} />}
          onClick={() => navigate('/leads?status=QUALIFIED')}
        />
        <StatCard
          label="Hot Leads"
          value={leads.hotLeads}
          icon={<TrendingUp size={20} />}
          change="Grade A / A+"
          onClick={() => navigate('/leads/scoring-analytics')}
        />
        <StatCard
          label="Converted"
          value={leads.convertedLeads}
          icon={<ClipboardList size={20} />}
          onClick={() => navigate('/leads?status=APPLICATION_CREATED')}
        />
        <StatCard
          label="Commission Outstanding"
          value={formatCurrency(commissions.commissionOutstanding)}
          icon={<Wallet size={20} />}
          onClick={() => navigate('/commissions')}
        />
        <StatCard
          label="Pending Documents"
          value={pendingDocuments.data?.meta.total ?? 0}
          icon={<FileText size={20} />}
          onClick={() => navigate('/documents?status=PENDING_VERIFICATION')}
        />
        <StatCard
          label="Rec. Acceptance"
          value={`${(recommendationAnalytics.data as { acceptanceRate?: number } | undefined)?.acceptanceRate ?? 0}%`}
          icon={<TrendingUp size={20} />}
          onClick={() => navigate('/recommendations/analytics')}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Branch Performance">
          {branchData.length === 0 ? (
            <EmptyState title="No branch data" description="Lead performance by branch will appear here." />
          ) : (
            <ChartPanel>
              {({ width, height }) => (
                <BarChart width={width} height={height} data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: 'var(--color-text)' }} />
                  <Legend />
                  <Bar dataKey="total" name="Total Leads" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" name="Converted" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ChartPanel>
          )}
        </Card>

        <Card title="Executive Performance">
          {executiveData.length === 0 ? (
            <EmptyState title="No executive data" description="Assigned executive metrics will appear here." />
          ) : (
            <ChartPanel>
              {({ width, height }) => (
                <BarChart width={width} height={height} data={executiveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Legend />
                  <Bar dataKey="total" name="Assigned" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" name="Converted" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ChartPanel>
          )}
        </Card>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Leads by Status">
          {statusData.length === 0 ? (
            <EmptyState title="No status breakdown" />
          ) : (
            <ChartPanel>
              {({ width, height }) => (
                <PieChart width={width} height={height}>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                </PieChart>
              )}
            </ChartPanel>
          )}
        </Card>

        <Card title="Pending Document Verification">
          {pendingDocuments.isLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (pendingDocuments.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="All clear" description="No documents pending verification." />
          ) : (
            <DataTable
              columns={[
                { key: 'documentType', header: 'Type', render: (r) => documentTypeLabel(r) },
                { key: 'customer', header: 'Customer', render: (r) => customerLabel(r) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge status={str(r.status)} />,
                },
              ]}
              data={pendingDocuments.data?.items ?? []}
              onRowClick={(row) => navigate(`/documents/${row.id}`)}
            />
          )}
        </Card>
      </div>

      <Card title="Recent Activity">
        {activities.length === 0 ? (
          <EmptyState title="No recent activity" description="Leads and applications will show up here." />
        ) : (
          <DataTable
            columns={[
              { key: 'type', header: 'Type' },
              { key: 'title', header: 'Reference' },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge status={r.status} />,
              },
              {
                key: 'time',
                header: 'When',
                render: (r) => formatDateTime(r.time),
              },
            ]}
            data={activities}
            keyField="id"
            onRowClick={(row) => navigate(row.path)}
          />
        )}
      </Card>
    </div>
  );
}
