import { TimeFilterBar } from '@/features/analytics/components/TimeFilterBar';
import type { AnalyticsTimePreset } from '@/services/analytics.service';
import type { ExecutivePeriodType, ExecutiveRoleType } from '@/services/executive-analytics.service';

const ROLES: { value: ExecutiveRoleType; label: string }[] = [
  { value: 'SALES_EXECUTIVE', label: 'Sales Executive' },
  { value: 'RELATIONSHIP_MANAGER', label: 'Relationship Manager' },
  { value: 'CREDIT_EXECUTIVE', label: 'Credit Executive' },
  { value: 'OPERATIONS_EXECUTIVE', label: 'Operations Executive' },
];

const PERIODS: { value: ExecutivePeriodType; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

type Props = {
  timePreset: AnalyticsTimePreset;
  periodType: ExecutivePeriodType;
  executiveRole?: ExecutiveRoleType;
  onTimePresetChange: (v: AnalyticsTimePreset, from?: string, to?: string) => void;
  onPeriodTypeChange: (v: ExecutivePeriodType) => void;
  onRoleChange: (v: ExecutiveRoleType | undefined) => void;
  fromDate?: string;
  toDate?: string;
};

export function ExecutiveFilterBar({
  timePreset,
  periodType,
  executiveRole,
  onTimePresetChange,
  onPeriodTypeChange,
  onRoleChange,
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
      <div className="analytics-preset-group">
        <span className="analytics-filter-label">Role</span>
        <button
          type="button"
          className={`analytics-preset-btn${!executiveRole ? ' active' : ''}`}
          onClick={() => onRoleChange(undefined)}
        >
          Auto
        </button>
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            className={`analytics-preset-btn${executiveRole === r.value ? ' active' : ''}`}
            onClick={() => onRoleChange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
