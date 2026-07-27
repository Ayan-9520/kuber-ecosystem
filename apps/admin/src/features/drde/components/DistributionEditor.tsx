import type { DistributionRule, StakeholderShare, StakeholderType } from '../data/types';
import { STAKEHOLDER_TYPE_OPTIONS } from '../data/types';
import { isShareSumValid, sumPercentShares } from '../data/permissions';

interface DistributionEditorProps {
  rule: DistributionRule;
  canEdit?: boolean;
  draft: StakeholderShare[];
  gstPercent: number;
  tdsPercent: number;
  onStakeholdersChange: (next: StakeholderShare[]) => void;
  onGstChange: (value: number) => void;
  onTdsChange: (value: number) => void;
}

function emptyShare(): StakeholderShare {
  return {
    stakeholderType: 'PARTNER',
    label: 'Financial Partner',
    mode: 'PERCENT',
    percentage: 0,
    fixedAmount: 0,
  };
}

export function DistributionEditor({
  rule,
  canEdit = false,
  draft,
  gstPercent,
  tdsPercent,
  onStakeholdersChange,
  onGstChange,
  onTdsChange,
}: DistributionEditorProps) {
  const percentSum = sumPercentShares(draft);
  const balanced = isShareSumValid(draft);

  const updateAt = (idx: number, patch: Partial<StakeholderShare>) => {
    if (!canEdit) return;
    onStakeholdersChange(draft.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeAt = (idx: number) => {
    if (!canEdit) return;
    onStakeholdersChange(draft.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {!canEdit ? (
        <p className="drde-locked">View only — configure permission required to edit</p>
      ) : (
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 0 }}>
          Unlimited stakeholders. Percentage shares must sum to 100%. GST / TDS applied server-side on
          simulate and run.
        </p>
      )}

      <p className="text-muted" style={{ fontSize: '0.8rem' }}>
        Rule scope: <strong>{rule.scope}</strong>
        {rule.matchingCriteria.product ? ` · ${rule.matchingCriteria.product}` : ''}
        {rule.matchingCriteria.lenderName ? ` · ${rule.matchingCriteria.lenderName}` : ''}
        {rule.matchingCriteria.partnerTier ? ` · Tier ${rule.matchingCriteria.partnerTier}` : ''}
      </p>

      <div className="drde-form-grid">
        <div className="drde-field">
          <label htmlFor="gstPercent">GST %</label>
          <input
            id="gstPercent"
            type="number"
            min={0}
            max={100}
            step={0.01}
            disabled={!canEdit}
            value={gstPercent}
            onChange={(e) => onGstChange(Number(e.target.value) || 0)}
          />
        </div>
        <div className="drde-field">
          <label htmlFor="tdsPercent">TDS %</label>
          <input
            id="tdsPercent"
            type="number"
            min={0}
            max={100}
            step={0.01}
            disabled={!canEdit}
            value={tdsPercent}
            onChange={(e) => onTdsChange(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem' }}>Stakeholders</h4>
        {draft.map((share, idx) => (
          <div key={`${share.stakeholderType}-${share.label}-${idx}`} className="drde-form-grid" style={{ marginBottom: '0.5rem' }}>
            <div className="drde-field">
              <label>Type</label>
              <select
                disabled={!canEdit}
                value={share.stakeholderType}
                onChange={(e) => {
                  const stakeholderType = e.target.value as StakeholderType;
                  const opt = STAKEHOLDER_TYPE_OPTIONS.find((o) => o.value === stakeholderType);
                  updateAt(idx, { stakeholderType, label: opt?.label ?? share.label });
                }}
              >
                {STAKEHOLDER_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="drde-field">
              <label>Label</label>
              <input
                disabled={!canEdit}
                value={share.label}
                onChange={(e) => updateAt(idx, { label: e.target.value })}
              />
            </div>
            <div className="drde-field">
              <label>Mode</label>
              <select
                disabled={!canEdit}
                value={share.mode}
                onChange={(e) =>
                  updateAt(idx, {
                    mode: e.target.value as StakeholderShare['mode'],
                    percentage: e.target.value === 'PERCENT' ? share.percentage || 0 : 0,
                    fixedAmount: e.target.value === 'FIXED' ? share.fixedAmount || 0 : 0,
                  })
                }
              >
                <option value="PERCENT">Percentage</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </div>
            {share.mode === 'PERCENT' ? (
              <div className="drde-field">
                <label>Share %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  disabled={!canEdit}
                  value={share.percentage}
                  onChange={(e) => updateAt(idx, { percentage: Number(e.target.value) || 0 })}
                />
              </div>
            ) : (
              <div className="drde-field">
                <label>Fixed amount</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  disabled={!canEdit}
                  value={share.fixedAmount}
                  onChange={(e) => updateAt(idx, { fixedAmount: Number(e.target.value) || 0 })}
                />
              </div>
            )}
            {canEdit ? (
              <div className="drde-field" style={{ alignSelf: 'end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => removeAt(idx)}>
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {canEdit ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onStakeholdersChange([...draft, emptyShare()])}
          >
            Add stakeholder
          </button>
        ) : null}
      </div>

      <div className="drde-balance">
        <div className={`drde-balance__chip ${balanced ? 'is-ok' : 'is-bad'}`}>
          <span>Percentage sum</span>
          <strong>{balanced ? '100%' : `${percentSum.toFixed(2)}%`}</strong>
        </div>
        <div className="drde-balance__chip">
          <span>Stakeholders</span>
          <strong>{draft.length}</strong>
        </div>
        <div className="drde-balance__chip">
          <span>GST / TDS</span>
          <strong>
            {gstPercent}% / {tdsPercent}%
          </strong>
        </div>
      </div>
    </div>
  );
}
