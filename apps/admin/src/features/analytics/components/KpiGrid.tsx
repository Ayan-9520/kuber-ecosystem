import { StatCard } from '@/components/ui';
import { formatCurrency, formatPercent } from '@/lib/utils';

type Kpi = { code: string; name: string; value: number; unit?: string };

export function KpiGrid({ kpis, loading }: { kpis: Kpi[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="stat-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-stat" />
        ))}
      </div>
    );
  }

  const formatValue = (kpi: Kpi) => {
    if (kpi.unit === 'INR') return formatCurrency(kpi.value);
    if (kpi.unit === 'percent') return formatPercent(kpi.value);
    return String(kpi.value);
  };

  return (
    <div className="stat-grid">
      {kpis.map((kpi) => (
        <StatCard key={kpi.code} label={kpi.name} value={formatValue(kpi)} />
      ))}
    </div>
  );
}
