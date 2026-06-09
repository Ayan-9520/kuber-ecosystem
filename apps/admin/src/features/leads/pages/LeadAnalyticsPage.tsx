import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  StatCard,
} from '@/components/ui';
import { CHART_COLORS, CHART_DANGER, CHART_GRID, CHART_SUCCESS, CHART_TICK, CHART_TOOLTIP } from '@/lib/chart-theme';
import { formatPercent } from '@/lib/utils';
import { leadsService } from '@/services/index';

export function LeadAnalyticsPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lead-analytics'],
    queryFn: () => leadsService.analytics(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) {
    return (
      <div className="page-container">
        <EmptyState title="Failed to load analytics" />
      </div>
    );
  }

  const statusData = Object.entries(data.byStatus).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  const gradeData = Object.entries(data.byGrade).map(([name, value]) => ({
    name,
    value,
  }));

  const sourceData = data.bySource.map((s) => ({
    name: s.sourceName,
    count: s.count,
  }));

  const branchData = data.branchPerformance.map((b) => ({
    name: b.branchName ?? '—',
    total: b.totalLeads,
    converted: b.converted,
    lost: b.lost,
    conversionRate: b.totalLeads > 0 ? (b.converted / b.totalLeads) * 100 : 0,
  }));

  const executiveData = data.executivePerformance.map((e) => ({
    name: e.employeeName ?? '—',
    total: e.totalLeads,
    converted: e.converted,
    lost: e.lost,
    conversionRate: e.totalLeads > 0 ? (e.converted / e.totalLeads) * 100 : 0,
  }));

  const totalLeads = statusData.reduce((sum, s) => sum + s.value, 0);
  const conversionRate = totalLeads > 0 ? (data.convertedLeads / totalLeads) * 100 : 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Lead Analytics"
        subtitle="Performance insights across branches, executives, and sources"
        actions={
          <Button variant="ghost" onClick={() => navigate('/leads')}>
            <ArrowLeft size={16} />
            Back to Leads
          </Button>
        }
      />

      <div className="stat-grid">
        <StatCard label="Today's Leads" value={data.todayLeads} />
        <StatCard label="Qualified" value={data.qualifiedLeads} />
        <StatCard label="Hot Leads (A/A+)" value={data.hotLeads} />
        <StatCard label="Converted" value={data.convertedLeads} />
        <StatCard label="Lost" value={data.lostLeads} />
        <StatCard label="Conversion Rate" value={formatPercent(conversionRate)} change="All-time pipeline" />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Leads by Status">
          {statusData.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Leads by Grade">
          {gradeData.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="value" name="Leads" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Lead Sources">
          {sourceData.length === 0 ? (
            <EmptyState title="No source data" />
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis type="number" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: CHART_TICK, fontSize: 11 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="count" name="Leads" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Branch Performance">
          {branchData.length === 0 ? (
            <EmptyState title="No branch data" />
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" name="Converted" fill={CHART_SUCCESS} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lost" name="Lost" fill={CHART_DANGER} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card title="Executive Performance">
        {executiveData.length === 0 ? (
          <EmptyState title="No executive data" />
        ) : (
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={executiveData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 11 }} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Legend />
                <Bar dataKey="total" name="Assigned" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
