import { useMemo } from 'react';

import type { LoanCaseStakeholder, LoanStakeholderType } from '../data/types';

import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export interface DistributionRow {
  id: string;
  stakeholderType: LoanStakeholderType;
  stakeholderName: string;
  sharePercent: number;
  amount: number;
}

interface RevenueDistributionPanelProps {
  rows: DistributionRow[];
  totalPool: number;
  editable?: boolean;
  onChange?: (rows: DistributionRow[]) => void;
  onSave?: () => void;
  saving?: boolean;
}

const STAKEHOLDER_TYPES: LoanStakeholderType[] = [
  'PARTNER',
  'CONNECTOR',
  'BROKER',
  'EMPLOYEE',
  'TEAM_LEADER',
  'SALES_MANAGER',
  'RELATIONSHIP_MANAGER',
  'OPERATIONS',
  'FINANCE',
  'COMPANY',
  'OTHER',
];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function stakeholdersToRows(stakeholders: LoanCaseStakeholder[]): DistributionRow[] {
  return stakeholders.map((s) => ({
    id: s.id,
    stakeholderType: s.stakeholderType,
    stakeholderName: s.stakeholderName,
    sharePercent: Number(s.sharePercent),
    amount: Number(s.amount),
  }));
}

export function RevenueDistributionPanel({
  rows,
  totalPool,
  editable = false,
  onChange,
  onSave,
  saving,
}: RevenueDistributionPanelProps) {
  const totals = useMemo(() => {
    const pct = rows.reduce((s, r) => s + (Number(r.sharePercent) || 0), 0);
    const amt = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return { pct: round2(pct), amt: round2(amt) };
  }, [rows]);

  const balanced = Math.abs(totals.pct - 100) < 0.05;

  const updateRow = (id: string, patch: Partial<DistributionRow>, syncFrom: 'pct' | 'amount') => {
    if (!onChange) return;
    onChange(
      rows.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        if (syncFrom === 'pct' && totalPool > 0) {
          next.amount = round2(((Number(next.sharePercent) || 0) / 100) * totalPool);
        } else if (syncFrom === 'amount' && totalPool > 0) {
          next.sharePercent = round2(((Number(next.amount) || 0) / totalPool) * 100);
        }
        return next;
      }),
    );
  };

  const addRow = () => {
    if (!onChange) return;
    onChange([
      ...rows,
      {
        id: `new-${Date.now()}`,
        stakeholderType: 'OTHER',
        stakeholderName: '',
        sharePercent: 0,
        amount: 0,
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (!onChange || rows.length <= 1) return;
    onChange(rows.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="data-table-wrapper">
        <table className="lf-dist-table">
          <thead>
            <tr>
              <th>Stakeholder</th>
              <th>Type</th>
              <th>%</th>
              <th>Amount</th>
              {editable ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {editable ? (
                    <input
                      value={row.stakeholderName}
                      placeholder="Name"
                      onChange={(e) => updateRow(row.id, { stakeholderName: e.target.value }, 'pct')}
                      style={{ maxWidth: 160 }}
                    />
                  ) : (
                    row.stakeholderName || '—'
                  )}
                </td>
                <td>
                  {editable ? (
                    <select
                      className="form-select"
                      value={row.stakeholderType}
                      onChange={(e) =>
                        updateRow(row.id, { stakeholderType: e.target.value as LoanStakeholderType }, 'pct')
                      }
                      style={{ maxWidth: 160 }}
                    >
                      {STAKEHOLDER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    row.stakeholderType.replace(/_/g, ' ')
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={row.sharePercent}
                      onChange={(e) =>
                        updateRow(row.id, { sharePercent: Number(e.target.value) || 0 }, 'pct')
                      }
                    />
                  ) : (
                    `${Number(row.sharePercent).toFixed(2)}%`
                  )}
                </td>
                <td>
                  {editable ? (
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(row.id, { amount: Number(e.target.value) || 0 }, 'amount')
                      }
                    />
                  ) : (
                    formatCurrency(row.amount)
                  )}
                </td>
                {editable ? (
                  <td>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.id)}>
                      Remove
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lf-dist-footer">
        <div className="lf-dist-total">
          <span>
            Share total: <strong>{totals.pct.toFixed(2)}%</strong>
          </span>
          <span>
            Amount total: <strong>{formatCurrency(totals.amt)}</strong>
          </span>
          <span>
            Pool: <strong>{formatCurrency(totalPool)}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {balanced ? (
            <span className="lf-dist-ok">Balanced · 100%</span>
          ) : (
            <span className="lf-dist-bad">Must sum to 100% (off by {(totals.pct - 100).toFixed(2)})</span>
          )}
          {editable ? (
            <>
              <Button type="button" variant="secondary" size="sm" onClick={addRow}>
                Add row
              </Button>
              {onSave ? (
                <Button type="button" size="sm" disabled={!balanced || saving} loading={saving} onClick={onSave}>
                  Save distribution
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
