import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Scale } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DistributionEditor } from '../components/DistributionEditor';
import { canDrdeAction, DRDE_MODULES, isShareSumValid, resolveDrdeRole } from '../data/permissions';
import type {
  DistributionRule,
  DistributionRun,
  DrdeModuleId,
  SimulationResult,
  StakeholderShare,
} from '../data/types';

import { Button, Card, EmptyState, PageHeader, StatCard, TableSkeleton } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils';
import { revenueDistributionService } from '@/services/index';

import '../drde.css';

function cloneShares(shares: StakeholderShare[]): StakeholderShare[] {
  return shares.map((s) => ({ ...s }));
}

export function DrdePage() {
  const queryClient = useQueryClient();
  const { user } = usePermissions();
  const role = resolveDrdeRole({ roles: user?.roles, permissions: user?.permissions });
  const modules = useMemo(() => DRDE_MODULES.filter((m) => m.roles.includes(role)), [role]);
  const canConfigure = canDrdeAction(role, 'configureDistribution') || canDrdeAction(role, 'editPayouts');

  const [active, setActive] = useState<DrdeModuleId>(modules[0]?.id ?? 'revenue-distribution');
  const [selectedId, setSelectedId] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [draftShares, setDraftShares] = useState<StakeholderShare[]>([]);
  const [draftGst, setDraftGst] = useState(18);
  const [draftTds, setDraftTds] = useState(5);

  const [simGross, setSimGross] = useState('100000');
  const [simProduct, setSimProduct] = useState('Home Loan');
  const [simLender, setSimLender] = useState('HDFC Bank');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const [runSourceRef, setRunSourceRef] = useState('');

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const summaryQuery = useQuery({
    queryKey: ['revenue-distribution', 'summary'],
    queryFn: () => revenueDistributionService.summary(),
  });

  const rulesQuery = useQuery({
    queryKey: ['revenue-distribution', 'rules'],
    queryFn: () => revenueDistributionService.listRules({ page: 1, limit: 100 }),
  });

  const runsQuery = useQuery({
    queryKey: ['revenue-distribution', 'runs'],
    queryFn: () => revenueDistributionService.listRuns({ page: 1, limit: 50 }),
    enabled: active === 'runs' || active === 'simulate',
  });

  const auditQuery = useQuery({
    queryKey: ['revenue-distribution', 'audit', selectedId],
    queryFn: () =>
      revenueDistributionService.listAudit({
        page: 1,
        limit: 50,
        ...(selectedId ? { entityId: selectedId } : {}),
      }),
    enabled: active === 'audit-log',
  });

  const rules = rulesQuery.data?.items ?? [];
  const selected = rules.find((r) => r.id === selectedId) ?? rules[0];

  useEffect(() => {
    if (!selectedId && rules[0]?.id) {
      setSelectedId(rules[0].id);
    }
  }, [rules, selectedId]);

  useEffect(() => {
    if (!selected) return;
    setDraftShares(cloneShares(selected.stakeholders));
    setDraftGst(selected.gstPercent);
    setDraftTds(selected.tdsPercent);
  }, [selected?.id, selected?.updatedAt]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['revenue-distribution'] });
  };

  const saveMutation = useMutation({
    mutationFn: (rule: DistributionRule) =>
      revenueDistributionService.updateRule(rule.id, {
        stakeholders: draftShares,
        gstPercent: draftGst,
        tdsPercent: draftTds,
      }),
    onSuccess: () => {
      notify('Distribution rule saved');
      invalidateAll();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (rule: DistributionRule) =>
      revenueDistributionService.updateRule(rule.id, { isActive: !rule.isActive }),
    onSuccess: () => {
      notify('Rule status updated');
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => revenueDistributionService.deleteRule(id),
    onSuccess: () => {
      notify('Rule soft-deleted');
      setSelectedId('');
      invalidateAll();
    },
  });

  const simulateMutation = useMutation({
    mutationFn: () =>
      revenueDistributionService.simulate({
        grossRevenue: Number(simGross) || 0,
        ruleId: selected?.id,
        context: {
          product: simProduct || undefined,
          lenderName: simLender || undefined,
        },
      }),
    onSuccess: (result) => {
      setSimResult(result);
      notify('Simulation complete');
    },
  });

  const createRunMutation = useMutation({
    mutationFn: () =>
      revenueDistributionService.createRun({
        sourceRef: runSourceRef.trim() || `CASE-${Date.now().toString().slice(-6)}`,
        grossRevenue: Number(simGross) || 0,
        ruleId: selected?.id,
        context: {
          product: simProduct || undefined,
          lenderName: simLender || undefined,
        },
      }),
    onSuccess: (run: DistributionRun) => {
      notify(`Run saved for ${run.sourceRef}`);
      setActive('runs');
      invalidateAll();
    },
  });

  const mutationError =
    saveMutation.error ||
    toggleActiveMutation.error ||
    deleteMutation.error ||
    simulateMutation.error ||
    createRunMutation.error;

  const summary = summaryQuery.data;
  const isLoading = summaryQuery.isLoading || rulesQuery.isLoading;
  const isError = summaryQuery.isError || rulesQuery.isError;

  const onSave = () => {
    if (!selected || !canConfigure) return;
    if (!isShareSumValid(draftShares)) {
      notify('Percentage shares must sum to 100 before saving');
      return;
    }
    saveMutation.mutate(selected);
  };

  if (isLoading) {
    return (
      <div className="drde-page page-container">
        <PageHeader
          title="Dynamic Revenue Distribution Engine"
          subtitle="Loading distribution rules…"
        />
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="drde-page page-container">
        <PageHeader title="Dynamic Revenue Distribution Engine" subtitle="Could not load DRDE data" />
        <EmptyState
          icon={<Scale size={32} />}
          title="Failed to load revenue distribution"
          description={getApiErrorMessage(summaryQuery.error ?? rulesQuery.error)}
          action={
            <Button
              type="button"
              onClick={() => {
                void summaryQuery.refetch();
                void rulesQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="drde-page page-container">
        <PageHeader
          title="Dynamic Revenue Distribution Engine"
          subtitle="Configure stakeholder splits with GST & TDS"
        />
        <EmptyState
          icon={<Scale size={32} />}
          title="No distribution rules yet"
          description="Rules appear here once seeded or created. Ask an admin with configure access to add the first template."
        />
      </div>
    );
  }

  return (
    <div className="drde-page page-container">
      <PageHeader
        title="Dynamic Revenue Distribution Engine"
        subtitle="Rule-based commission split — simulate before locking a run."
        actions={<span className="drde-role-pill">Role: {role.split('_').join(' ')}</span>}
      />

      {toast ? (
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>{toast}</p>
        </Card>
      ) : null}

      {mutationError ? (
        <Card>
          <p className="form-error" style={{ margin: 0 }}>
            {getApiErrorMessage(mutationError)}
          </p>
        </Card>
      ) : null}

      <div className="stat-grid">
        <StatCard label="Total rules" value={String(summary?.totalRules ?? 0)} />
        <StatCard label="Active rules" value={String(summary?.activeRules ?? 0)} />
        <StatCard label="Total distributed" value={formatCurrency(summary?.totalDistributed ?? 0)} />
        <StatCard label="Pending runs" value={String(summary?.pendingRuns ?? 0)} />
        <StatCard label="Stakeholders" value={String(summary?.stakeholderCount ?? 0)} />
        <StatCard label="Stakeholder types" value={String(summary?.uniqueStakeholderTypes ?? 0)} />
      </div>

      <div className="drde-modules">
        {modules.map((mod) => (
          <button
            key={mod.id}
            type="button"
            className={`drde-module${active === mod.id ? ' is-active' : ''}`}
            onClick={() => setActive(mod.id)}
          >
            <p className="drde-module__label">{mod.label}</p>
            <p className="drde-module__desc">{mod.description}</p>
          </button>
        ))}
      </div>

      <div className="drde-layout">
        <Card title="Rules">
          <div className="drde-case-list">
            {rules.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`drde-case-item${r.id === selected.id ? ' is-active' : ''}`}
                onClick={() => setSelectedId(r.id)}
              >
                <strong>{r.name}</strong>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {r.scope} · priority {r.priority}
                </div>
                <div style={{ marginTop: 6 }}>
                  <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card
          title={selected.name}
          actions={
            selected.isActive ? (
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                Active
              </span>
            ) : (
              <span className="drde-locked">Inactive</span>
            )
          }
        >
          {active === 'revenue-distribution' && (
            <>
              <DistributionEditor
                rule={selected}
                canEdit={canConfigure}
                draft={draftShares}
                gstPercent={draftGst}
                tdsPercent={draftTds}
                onStakeholdersChange={setDraftShares}
                onGstChange={setDraftGst}
                onTdsChange={setDraftTds}
              />
              <div className="drde-actions">
                {canConfigure ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={saveMutation.isPending}
                      onClick={onSave}
                    >
                      Save distribution
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={toggleActiveMutation.isPending}
                      onClick={() => toggleActiveMutation.mutate(selected)}
                    >
                      {selected.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(selected.id)}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <p className="text-muted">View only — configure permission required.</p>
                )}
                {canDrdeAction(role, 'exportReports') ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => notify('DRDE export queued')}>
                    Export report
                  </Button>
                ) : null}
              </div>
            </>
          )}

          {active === 'simulate' && (
            <>
              <div className="drde-form-grid">
                <div className="drde-field">
                  <label htmlFor="simGross">Gross revenue</label>
                  <input
                    id="simGross"
                    type="number"
                    min={0}
                    step={0.01}
                    value={simGross}
                    onChange={(e) => setSimGross(e.target.value)}
                  />
                </div>
                <div className="drde-field">
                  <label htmlFor="simProduct">Product</label>
                  <input
                    id="simProduct"
                    value={simProduct}
                    onChange={(e) => setSimProduct(e.target.value)}
                  />
                </div>
                <div className="drde-field">
                  <label htmlFor="simLender">Lender</label>
                  <input id="simLender" value={simLender} onChange={(e) => setSimLender(e.target.value)} />
                </div>
                {canDrdeAction(role, 'createRun') ? (
                  <div className="drde-field">
                    <label htmlFor="runSource">Source ref (for run)</label>
                    <input
                      id="runSource"
                      value={runSourceRef}
                      placeholder="CASE-HL-8821"
                      onChange={(e) => setRunSourceRef(e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <div className="drde-actions">
                {canDrdeAction(role, 'simulate') ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={simulateMutation.isPending}
                    onClick={() => simulateMutation.mutate()}
                  >
                    Simulate
                  </Button>
                ) : null}
                {canDrdeAction(role, 'createRun') ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={createRunMutation.isPending}
                    onClick={() => createRunMutation.mutate()}
                  >
                    Persist run
                  </Button>
                ) : null}
              </div>

              {simResult ? (
                <>
                  <div className="stat-grid" style={{ marginTop: '1rem' }}>
                    <StatCard label="Gross" value={formatCurrency(simResult.grossRevenue)} />
                    <StatCard label="GST" value={formatCurrency(simResult.gstAmount)} />
                    <StatCard label="TDS" value={formatCurrency(simResult.tdsAmount)} />
                    <StatCard label="Net" value={formatCurrency(simResult.netRevenue)} />
                    <StatCard
                      label="Balance"
                      value={simResult.isBalanced ? 'OK' : formatCurrency(simResult.remainder)}
                    />
                  </div>
                  <div className="earnings-table-wrap" style={{ marginTop: '1rem' }}>
                    <table className="drde-table">
                      <thead>
                        <tr>
                          <th>Stakeholder</th>
                          <th>Type</th>
                          <th>%</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simResult.allocations.map((a) => (
                          <tr key={`${a.stakeholderType}-${a.label}`}>
                            <td>{a.label}</td>
                            <td>{a.stakeholderType}</td>
                            <td>{a.mode === 'PERCENT' ? `${a.percentage}%` : 'Fixed'}</td>
                            <td>{formatCurrency(a.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted">Run a simulation to preview GST, TDS, and stakeholder allocations.</p>
              )}
            </>
          )}

          {active === 'runs' && (
            <>
              {runsQuery.isLoading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : runsQuery.isError ? (
                <EmptyState
                  icon={<Scale size={28} />}
                  title="Failed to load runs"
                  description={getApiErrorMessage(runsQuery.error)}
                  action={
                    <Button type="button" onClick={() => void runsQuery.refetch()}>
                      Retry
                    </Button>
                  }
                />
              ) : (runsQuery.data?.items.length ?? 0) === 0 ? (
                <EmptyState
                  icon={<Scale size={28} />}
                  title="No distribution runs yet"
                  description="Simulate a split, then persist a run against a loan case or commission reference."
                />
              ) : (
                <div className="earnings-table-wrap">
                  <table className="drde-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Rule</th>
                        <th>Gross</th>
                        <th>Net</th>
                        <th>Status</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(runsQuery.data?.items ?? []).map((run) => (
                        <tr key={run.id}>
                          <td>{run.sourceRef}</td>
                          <td>{run.ruleName ?? '—'}</td>
                          <td>{formatCurrency(run.grossRevenue)}</td>
                          <td>{formatCurrency(run.netRevenue)}</td>
                          <td>
                            <StatusBadge status={run.status} />
                          </td>
                          <td>{formatDate(run.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {active === 'audit-log' && (
            <>
              {auditQuery.isLoading ? (
                <TableSkeleton rows={5} cols={4} />
              ) : auditQuery.isError ? (
                <EmptyState
                  icon={<Scale size={28} />}
                  title="Failed to load audit"
                  description={getApiErrorMessage(auditQuery.error)}
                  action={
                    <Button type="button" onClick={() => void auditQuery.refetch()}>
                      Retry
                    </Button>
                  }
                />
              ) : (auditQuery.data?.items.length ?? 0) === 0 ? (
                <EmptyState
                  icon={<Scale size={28} />}
                  title="No audit events"
                  description="Rule and run changes will appear here."
                />
              ) : (
                <table className="drde-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>User</th>
                      <th>Entity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(auditQuery.data?.items ?? []).map((ev) => (
                      <tr key={ev.id}>
                        <td>{formatDate(ev.createdAt)}</td>
                        <td>{ev.actorName}</td>
                        <td>
                          {ev.entityType} · {ev.entityId.slice(0, 8)}
                        </td>
                        <td>{ev.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
