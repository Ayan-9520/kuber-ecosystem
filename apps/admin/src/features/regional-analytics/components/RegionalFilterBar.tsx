import { TimeFilterBar } from '@/features/analytics/components/TimeFilterBar';
import type { AnalyticsTimePreset } from '@/services/analytics.service';
import type { RegionalPeriodType } from '@/services/regional-analytics.service';

const PERIODS: { value: RegionalPeriodType; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

type Props = {
  timePreset: AnalyticsTimePreset;
  periodType: RegionalPeriodType;
  onTimePresetChange: (v: AnalyticsTimePreset, from?: string, to?: string) => void;
  onPeriodTypeChange: (v: RegionalPeriodType) => void;
  fromDate?: string;
  toDate?: string;
};

export function RegionalFilterBar({
  timePreset,
  periodType,
  onTimePresetChange,
  onPeriodTypeChange,
  fromDate,
  toDate,
}: Props) {
  return (
    <div className="analytics-filters">
      <TimeFilterBar timePreset={timePreset} fromDate={fromDate} toDate={toDate} onChange={onTimePresetChange} />
      <div className="analytics-preset-group">
        <span className="analytics-filter-label">Period</span>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`analytics-preset-btn${periodType === p.value ? ' active' : ''}`}
            onClick={() => onPeriodTypeChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
