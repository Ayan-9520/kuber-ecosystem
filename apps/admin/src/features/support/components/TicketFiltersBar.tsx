import { useMemo } from 'react';

import { Button } from '@/components/ui';
import {
  SAVED_VIEWS_KEY,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type SavedView,
  type TicketFilters,
} from '@/features/support/constants';

type Props = {
  filters: TicketFilters;
  onChange: (next: TicketFilters) => void;
  categories: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  onExport?: () => void;
  exportLoading?: boolean;
};

function readSavedViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedViews(views: SavedView[]) {
  localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
}

export function TicketFiltersBar({ filters, onChange, categories, users, onExport, exportLoading }: Props) {
  const savedViews = useMemo(() => readSavedViews(), [filters]);

  const set = (patch: Partial<TicketFilters>) => onChange({ ...filters, ...patch });

  const saveCurrentView = () => {
    const name = window.prompt('Name this view');
    if (!name?.trim()) return;
    const views = readSavedViews();
    views.push({ id: `view-${Date.now()}`, name: name.trim(), filters });
    writeSavedViews(views);
  };

  return (
    <div className="support-filters">
      <div className="support-filters-row">
        <label className="support-filter">
          <span>Status</span>
          <select value={filters.status ?? ''} onChange={(e) => set({ status: e.target.value || undefined })}>
            <option value="">All</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="support-filter">
          <span>Priority</span>
          <select value={filters.priority ?? ''} onChange={(e) => set({ priority: e.target.value || undefined })}>
            <option value="">All</option>
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="support-filter">
          <span>Category</span>
          <select value={filters.categoryId ?? ''} onChange={(e) => set({ categoryId: e.target.value || undefined })}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {String(c.name ?? c.code)}
              </option>
            ))}
          </select>
        </label>
        <label className="support-filter">
          <span>Assigned To</span>
          <select
            value={filters.assignedUserId ?? ''}
            onChange={(e) => set({ assignedUserId: e.target.value || undefined })}
          >
            <option value="">All</option>
            {users.map((u) => (
              <option key={String(u.id)} value={String(u.id)}>
                {String(u.email ?? u.id)}
              </option>
            ))}
          </select>
        </label>
        <label className="support-filter">
          <span>From</span>
          <input type="date" value={filters.fromDate ?? ''} onChange={(e) => set({ fromDate: e.target.value || undefined })} />
        </label>
        <label className="support-filter">
          <span>To</span>
          <input type="date" value={filters.toDate ?? ''} onChange={(e) => set({ toDate: e.target.value || undefined })} />
        </label>
        <label className="support-filter support-filter-checkbox">
          <input
            type="checkbox"
            checked={!!filters.slaBreached}
            onChange={(e) => set({ slaBreached: e.target.checked || undefined })}
          />
          <span>SLA Breached</span>
        </label>
      </div>
      <div className="support-filters-actions">
        <Button size="sm" variant="secondary" onClick={() => onChange({})}>
          Clear
        </Button>
        <Button size="sm" variant="secondary" onClick={saveCurrentView}>
          Save View
        </Button>
        {savedViews.map((view) => (
          <Button key={view.id} size="sm" variant="ghost" onClick={() => onChange(view.filters)}>
            {view.name}
          </Button>
        ))}
        {onExport && (
          <Button size="sm" variant="secondary" loading={exportLoading} onClick={onExport}>
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
