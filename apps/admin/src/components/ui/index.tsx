import type { PaginatedMeta } from '@kuberone/shared-types';
import type { ReactNode } from 'react';

import { Button } from './Button';

import { formatDocumentTypeLabel } from '@kuberone/shared-utils';

import { customerDisplayName, documentTypeDisplay } from '@/lib/entity-display';
import { paginationRange } from '@/lib/utils';

function formatCellValue(value: unknown, key?: string, row?: Record<string, unknown>): string {
  if (row) {
    if (key === 'documentType' || key === 'type') return documentTypeDisplay(row);
    if (key === 'customerName' || key === 'customer' || key === 'customerId') {
      return customerDisplayName(row);
    }
  }
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    return formatDocumentTypeLabel(value, row);
  }
  const asString = String(value);
  if (asString === '[object Object]') return 'Unknown Document';
  return asString;
}

export { Button } from './Button';
export { Card } from './Card';
export { ChartPanel } from './ChartPanel';
export { Input } from './Input';
export { Select } from './Select';
export { StatusBadge } from './Badge';

interface PaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, meta.page - Math.floor(maxVisible / 2));
  const end = Math.min(meta.totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (meta.totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span className="pagination-info">{paginationRange(meta)}</span>
      <div className="pagination-controls">
        <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`pagination-page${p === meta.page ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, change, onClick }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`stat-card${onClick ? ' stat-card--clickable' : ''}`}
      onClick={onClick}
    >
      {icon && <div className="stat-card-icon">{icon}</div>}
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {change && <span className="stat-card-change">{change}</span>}
    </Tag>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: `${60 + (i % 3) * 10}%` }} />
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem', marginTop: '1rem' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton skeleton-stat" />
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );
}

interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface DataTableProps<T> {
  columns: { key: string; header?: string; label?: string; render?: (row: T) => ReactNode }[];
  data: T[];
  onRowClick?: (row: T) => void;
  keyField?: keyof T & string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  keyField = 'id' as keyof T & string,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header ?? col.label ?? col.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              className={onRowClick ? 'clickable' : undefined}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row)
                    : formatCellValue(row[col.key], col.key, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-input-wrapper">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        className="form-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
