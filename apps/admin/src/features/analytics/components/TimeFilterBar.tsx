import type { AnalyticsTimePreset } from '@/services/analytics.service';

const PRESETS: { id: AnalyticsTimePreset; label: string }[] = [
  { id: 'TODAY', label: 'Today' },
  { id: 'YESTERDAY', label: 'Yesterday' },
  { id: 'THIS_WEEK', label: 'This Week' },
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'THIS_QUARTER', label: 'This Quarter' },
  { id: 'THIS_YEAR', label: 'This Year' },
  { id: 'CUSTOM', label: 'Custom' },
];

type Props = {
  timePreset: AnalyticsTimePreset;
  fromDate?: string;
  toDate?: string;
  onChange: (preset: AnalyticsTimePreset, from?: string, to?: string) => void;
};

export function TimeFilterBar({ timePreset, fromDate, toDate, onChange }: Props) {
  return (
    <div className="analytics-filters">
      <div className="analytics-preset-group">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`analytics-preset-btn${timePreset === p.id ? ' active' : ''}`}
            onClick={() => onChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {timePreset === 'CUSTOM' && (
        <div className="analytics-custom-range">
          <input type="date" value={fromDate ?? ''} onChange={(e) => onChange('CUSTOM', e.target.value, toDate)} />
          <span>to</span>
          <input type="date" value={toDate ?? ''} onChange={(e) => onChange('CUSTOM', fromDate, e.target.value)} />
        </div>
      )}
    </div>
  );
}
