import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  Landmark,
  Plus,
  RefreshCw,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import '../loan-fulfillment.css';
import { getProductLabel } from '../data/stages';

import { Button, Card, ChartPanel, EmptyState, PageHeader, StatCard, TableSkeleton } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { loanFulfillmentService } from '@/services/index';

const CHART_COLORS = ['#248396', '#10662A', '#B0E9B2', '#1c6a7a', '#3d8b6e', '#5a9ea8', '#7bc49a', '#0d4f5c'];

/** Compact ₹ axis labels so charts stay readable on narrow screens. */
function compactInr(value: number): string {
  const n = Math.abs(value);
  if (n >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${Math.round(value / 1_000)}K`;
  return `₹${value}`;
}

function monthLabel(month: string): string {
  const [year, mm] = month.split('-');
  if (!year || !mm) return month;
  const date = new Date(Number(year), Number(mm) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

export function LoanFulfillmentDashboardPage() {
  const query = useQuery({
    queryKey: ['loan-fulfillment', 'dashboard'],
    queryFn: () => loanFulfillmentService.dashboard(),
    staleTime: 60_000,
  });

  if (query.isLoading) {
    return (
      <div className="page-container loan-fulfillment">
        <PageHeader title="Loan Fulfillment" subtitle="Pipeline health, revenue, and payout readiness" />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="page-container loan-fulfillment">
        <PageHeader title="Loan Fulfillment" subtitle="Pipeline health, revenue, and payout readiness" />
        <div className="lf-empty">
          <EmptyState
            icon={<AlertTriangle size={36} />}
            title="Couldn’t load the fulfillment dashboard"
            description="The loan fulfillment service did not respond. Check your connection and try again."
            action={
              <Button type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>
                <RefreshCw size={14} style={{ marginRight: 6 }} />
                {query.isFetching ? 'Retrying…' : 'Retry'}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const dash = query.data;

  if (dash.totalCases === 0) {
    return (
      <div className="page-container loan-fulfillment">
        <PageHeader
          title="Loan Fulfillment"
          subtitle="Pipeline health, revenue, and payout readiness"
          actions={
            <Link to="/loan-fulfillment/cases/new" className="btn btn-primary">
              <Plus size={16} style={{ marginRight: 6 }} />
              Create loan case
            </Link>
          }
        />
        <div className="lf-empty">
          <EmptyState
            icon={<Briefcase size={36} />}
            title="No loan cases yet"
            description="Create your first loan case to start tracking the journey from login to sanction, disbursement and payout."
            action={
              <Link to="/loan-fulfillment/cases/new" className="btn btn-primary">
                Create loan case
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const pipeline = dash.pipeline.map((p) => ({ name: p.label, count: p.count, amount: p.amount ?? 0 }));
  const productMix = dash.loanTypeDistribution.map((d) => ({
    name: getProductLabel(d.name as never),
    value: d.amount,
  }));
  const monthly = dash.monthlyVolume.map((m) => ({
    name: monthLabel(m.month),
    disbursement: m.disbursement,
    revenue: m.revenue,
  }));

  return (
    <div className="page-container loan-fulfillment">
      <PageHeader
        title="Loan Fulfillment"
        subtitle="End-to-end case pipeline, bank revenue, and payout readiness"
        actions={
          <div className="lf-header-actions">
            <Button type="button" variant="secondary" onClick={() => void query.refetch()} disabled={query.isFetching}>
              <RefreshCw size={14} style={{ marginRight: 6 }} />
              Refresh
            </Button>
            <Link to="/loan-fulfillment/cases/new" className="btn btn-primary">
              <Plus size={16} style={{ marginRight: 6 }} />
              New case
            </Link>
          </div>
        }
      />

      <section className="lf-kpi-block">
        <h2 className="lf-section-title">Today</h2>
        <div className="lf-kpi-grid">
          <StatCard label="New cases" value={dash.todayLeads} icon={<Briefcase size={18} />} />
          <StatCard label="Bank logins" value={dash.todayLogins} icon={<Landmark size={18} />} />
          <StatCard label="Sanctions" value={dash.todaySanctions} icon={<CheckCircle2 size={18} />} />
          <StatCard label="Disbursements" value={dash.todayDisbursements} icon={<TrendingUp size={18} />} />
        </div>
      </section>

      <section className="lf-kpi-block">
        <h2 className="lf-section-title">Pipeline &amp; revenue</h2>
        <div className="lf-kpi-grid">
          <StatCard label="Total cases" value={dash.totalCases} icon={<Briefcase size={18} />} />
          <StatCard label="Active pipeline" value={dash.activeCases} icon={<TrendingUp size={18} />} />
          <StatCard label="Sanctioned" value={dash.sanctionedCount} />
          <StatCard label="Disbursed" value={dash.disbursedCount} />
          <StatCard label="Pipeline value" value={formatCurrency(dash.totalPipelineValue)} icon={<Landmark size={18} />} />
          <StatCard label="Disbursed value" value={formatCurrency(dash.totalDisbursedValue)} />
          <StatCard label="Expected revenue" value={formatCurrency(dash.expectedRevenue)} icon={<Wallet size={18} />} />
          <StatCard label="Revenue booked" value={formatCurrency(dash.revenueGenerated)} />
        </div>
      </section>

      <section className="lf-kpi-block">
        <h2 className="lf-section-title">Payouts &amp; workload</h2>
        <div className="lf-kpi-grid">
          <StatCard label="Pending payouts" value={formatCurrency(dash.pendingPayouts)} icon={<Wallet size={18} />} />
          <StatCard label="Paid payouts" value={formatCurrency(dash.paidPayouts)} />
          <StatCard label="Pending approvals" value={dash.pendingApprovals} icon={<ClipboardList size={18} />} />
          <StatCard label="Docs pending" value={dash.pendingDocumentCases} icon={<FileWarning size={18} />} />
          <StatCard label="Open tasks" value={dash.openTasks} />
          <StatCard label="Overdue tasks" value={dash.overdueTasks} icon={<AlertTriangle size={18} />} />
          <StatCard label="Avg cycle" value={`${dash.avgCycleDays} days`} />
          <StatCard label="Rejected" value={dash.rejectedCount} />
        </div>
      </section>

      <div className="lf-charts">
        <Card title="Pipeline funnel" subtitle="Cases by journey stage">
          <ChartPanel height={300}>
            {({ width, height }) => (
              <BarChart
                width={width}
                height={height}
                data={pipeline}
                margin={{ top: 8, right: 8, left: 0, bottom: 64 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--lf-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-32} textAnchor="end" interval={0} height={64} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip formatter={(v, key) => (key === 'amount' ? formatCurrency(Number(v)) : v)} />
                <Bar dataKey="count" name="Cases" fill="#248396" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ChartPanel>
        </Card>

        <Card title="Revenue by bank" subtitle="Lender contribution">
          {dash.revenueByBank.length === 0 ? (
            <EmptyState title="No lender revenue yet" description="Revenue appears once cases reach sanction." />
          ) : (
            <ChartPanel height={300}>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={dash.revenueByBank}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--lf-border)" />
                  <XAxis type="number" tickFormatter={(v) => compactInr(Number(v))} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" name="Revenue" fill="#10662A" radius={[0, 6, 6, 0]} />
                </BarChart>
              )}
            </ChartPanel>
          )}
        </Card>

        <Card title="Payout by partner" subtitle="Channel share">
          {dash.revenueByPartner.length === 0 ? (
            <EmptyState title="No partner payouts yet" description="Assign partners to cases to see channel share." />
          ) : (
            <ChartPanel height={300}>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={dash.revenueByPartner}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--lf-border)" />
                  <XAxis type="number" tickFormatter={(v) => compactInr(Number(v))} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" name="Payout" fill="#248396" radius={[0, 6, 6, 0]} />
                </BarChart>
              )}
            </ChartPanel>
          )}
        </Card>

        <Card title="Loan type mix" subtitle="Case volume by product">
          {productMix.length === 0 ? (
            <EmptyState title="No product data yet" />
          ) : (
            <ChartPanel height={300}>
              {({ width, height }) => (
                <PieChart width={width} height={height}>
                  <Pie
                    data={productMix}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={Math.max(36, Math.min(56, width / 6))}
                    outerRadius={Math.max(60, Math.min(92, width / 3.6))}
                    paddingAngle={2}
                  >
                    {productMix.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ChartPanel>
          )}
        </Card>

        <Card title="Monthly disbursement &amp; revenue" subtitle="Trend over time" className="lf-chart-wide">
          {monthly.length === 0 ? (
            <EmptyState title="No monthly trend yet" description="Trends build up as cases are disbursed." />
          ) : (
            <ChartPanel height={300}>
              {({ width, height }) => (
                <LineChart width={width} height={height} data={monthly} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--lf-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => compactInr(Number(v))} tick={{ fontSize: 11 }} width={56} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="disbursement" name="Disbursement" stroke="#248396" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10662A" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ChartPanel>
          )}
        </Card>

        {dash.revenueByEmployee.length > 0 && (
          <Card title="Top performers" subtitle="Incentive by financial professional">
            <ChartPanel height={300}>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={dash.revenueByEmployee.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--lf-border)" />
                  <XAxis type="number" tickFormatter={(v) => compactInr(Number(v))} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" name="Incentive" fill="#3d8b6e" radius={[0, 6, 6, 0]} />
                </BarChart>
              )}
            </ChartPanel>
          </Card>
        )}
      </div>
    </div>
  );
}
