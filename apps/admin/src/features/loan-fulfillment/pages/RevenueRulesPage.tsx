import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Percent, Plus, Scale } from 'lucide-react';
import { useState } from 'react';

import '../loan-fulfillment.css';
import { canLoanFulfillmentAction, resolveLoanFulfillmentRole } from '../data/permissions';
import { getProductLabel, PRODUCT_OPTIONS } from '../data/stages';
import type { LoanFulfillmentProduct, LoanRevenueRule } from '../data/types';

import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  TableSkeleton,
} from '@/components/ui';
import { useAuth } from '@/hooks/usePermissions';
import { formatDate, getApiErrorMessage } from '@/lib/utils';
import { loanFulfillmentService } from '@/services/index';

interface RuleForm {
  name: string;
  lenderName: string;
  product: LoanFulfillmentProduct | '';
  revenuePercent: string;
  gstPercent: string;
  tdsPercent: string;
  platformSharePercent: string;
  partnerSharePercent: string;
  employeeSharePercent: string;
  teamSharePercent: string;
  managerSharePercent: string;
  companySharePercent: string;
  effectiveFrom: string;
}

const EMPTY_FORM: RuleForm = {
  name: '',
  lenderName: '',
  product: '',
  revenuePercent: '',
  gstPercent: '18',
  tdsPercent: '5',
  platformSharePercent: '10',
  partnerSharePercent: '50',
  employeeSharePercent: '10',
  teamSharePercent: '5',
  managerSharePercent: '5',
  companySharePercent: '20',
  effectiveFrom: new Date().toISOString().slice(0, 10),
};

function validateRule(form: RuleForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.lenderName.trim()) errors.lenderName = 'Lender is required';
  if (!form.product) errors.product = 'Product is required';
  const revenue = Number(form.revenuePercent);
  if (!Number.isFinite(revenue) || revenue < 0 || revenue > 100) {
    errors.revenuePercent = 'Revenue % must be 0–100';
  }
  if (!form.effectiveFrom) errors.effectiveFrom = 'Effective from is required';

  const shares = [
    Number(form.platformSharePercent) || 0,
    Number(form.partnerSharePercent) || 0,
    Number(form.employeeSharePercent) || 0,
    Number(form.teamSharePercent) || 0,
    Number(form.managerSharePercent) || 0,
    Number(form.companySharePercent) || 0,
  ];
  const sum = shares.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.05) {
    errors.shares = `Share percents must sum to 100 (currently ${sum.toFixed(2)})`;
  }
  return errors;
}

export function RevenueRulesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = resolveLoanFulfillmentRole({ roles: user?.roles, permissions: user?.permissions });
  const canConfigure = canLoanFulfillmentAction(role, 'configureRevenueRules');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rulesQuery = useQuery({
    queryKey: ['loan-fulfillment', 'revenue-rules'],
    queryFn: () => loanFulfillmentService.listRevenueRules({ page: 1, limit: 100 }),
  });

  const create = useMutation({
    mutationFn: () =>
      loanFulfillmentService.createRevenueRule({
        name: form.name.trim(),
        lenderName: form.lenderName.trim(),
        product: form.product as LoanFulfillmentProduct,
        revenuePercent: Number(form.revenuePercent),
        gstPercent: Number(form.gstPercent) || 0,
        tdsPercent: Number(form.tdsPercent) || 0,
        platformSharePercent: Number(form.platformSharePercent) || 0,
        partnerSharePercent: Number(form.partnerSharePercent) || 0,
        employeeSharePercent: Number(form.employeeSharePercent) || 0,
        teamSharePercent: Number(form.teamSharePercent) || 0,
        managerSharePercent: Number(form.managerSharePercent) || 0,
        companySharePercent: Number(form.companySharePercent) || 0,
        isActive: true,
        effectiveFrom: new Date(form.effectiveFrom).toISOString(),
      }),
    onSuccess: () => {
      setShowForm(false);
      setForm(EMPTY_FORM);
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: ['loan-fulfillment', 'revenue-rules'] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: (rule: LoanRevenueRule) =>
      loanFulfillmentService.updateRevenueRule(rule.id, { isActive: !rule.isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['loan-fulfillment', 'revenue-rules'] });
    },
  });

  const setField = <K extends keyof RuleForm>(key: K, value: RuleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateRule(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    create.mutate();
  };

  const items = rulesQuery.data?.items ?? [];

  return (
    <div className="page-container loan-fulfillment">
      <PageHeader
        title="Revenue Rules"
        subtitle="Lender and product payout templates for fulfillment cases"
        actions={
          canConfigure ? (
            <Button type="button" onClick={() => setShowForm((v) => !v)}>
              <Plus size={16} style={{ marginRight: 6 }} />
              {showForm ? 'Close form' : 'New rule'}
            </Button>
          ) : undefined
        }
      />

      {showForm && canConfigure ? (
        <Card title="Create revenue rule">
          {create.error ? (
            <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>
              {getApiErrorMessage(create.error)}
            </div>
          ) : null}
          <form onSubmit={onSubmit}>
            <div className="lf-form-grid">
              <div className="lf-form-section">
                <Input label="Rule name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                {errors.name ? <p className="form-error">{errors.name}</p> : null}
                <Input
                  label="Lender"
                  value={form.lenderName}
                  onChange={(e) => setField('lenderName', e.target.value)}
                />
                {errors.lenderName ? <p className="form-error">{errors.lenderName}</p> : null}
                <Select
                  label="Product"
                  options={[{ value: '', label: 'Select product' }, ...PRODUCT_OPTIONS]}
                  value={form.product}
                  onChange={(e) => setField('product', e.target.value as LoanFulfillmentProduct | '')}
                />
                {errors.product ? <p className="form-error">{errors.product}</p> : null}
                <Input
                  label="Effective from"
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setField('effectiveFrom', e.target.value)}
                />
                {errors.effectiveFrom ? <p className="form-error">{errors.effectiveFrom}</p> : null}
              </div>
              <div className="lf-form-section">
                <h3>
                  <Percent size={14} style={{ marginRight: 6 }} />
                  Rates & shares
                </h3>
                <Input
                  label="Revenue %"
                  type="number"
                  value={form.revenuePercent}
                  onChange={(e) => setField('revenuePercent', e.target.value)}
                />
                {errors.revenuePercent ? <p className="form-error">{errors.revenuePercent}</p> : null}
                <Input
                  label="GST %"
                  type="number"
                  value={form.gstPercent}
                  onChange={(e) => setField('gstPercent', e.target.value)}
                />
                <Input
                  label="TDS %"
                  type="number"
                  value={form.tdsPercent}
                  onChange={(e) => setField('tdsPercent', e.target.value)}
                />
                <Input
                  label="Platform share %"
                  type="number"
                  value={form.platformSharePercent}
                  onChange={(e) => setField('platformSharePercent', e.target.value)}
                />
                <Input
                  label="Partner share %"
                  type="number"
                  value={form.partnerSharePercent}
                  onChange={(e) => setField('partnerSharePercent', e.target.value)}
                />
                <Input
                  label="Employee share %"
                  type="number"
                  value={form.employeeSharePercent}
                  onChange={(e) => setField('employeeSharePercent', e.target.value)}
                />
                <Input
                  label="Team share %"
                  type="number"
                  value={form.teamSharePercent}
                  onChange={(e) => setField('teamSharePercent', e.target.value)}
                />
                <Input
                  label="Manager share %"
                  type="number"
                  value={form.managerSharePercent}
                  onChange={(e) => setField('managerSharePercent', e.target.value)}
                />
                <Input
                  label="Company share %"
                  type="number"
                  value={form.companySharePercent}
                  onChange={(e) => setField('companySharePercent', e.target.value)}
                />
                {errors.shares ? <p className="form-error">{errors.shares}</p> : null}
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" loading={create.isPending}>
                Save rule
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {rulesQuery.isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : rulesQuery.isError ? (
        <div className="lf-empty">
          <EmptyState
            icon={<Scale size={32} />}
            title="Failed to load revenue rules"
            description="Could not reach the loan fulfillment API."
            action={
              <Button type="button" onClick={() => rulesQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : items.length === 0 ? (
        <div className="lf-empty">
          <EmptyState
            icon={<Scale size={32} />}
            title="No revenue rules yet"
            description="Define lender and product templates to auto-calculate case payouts."
            action={
              canConfigure ? (
                <Button type="button" onClick={() => setShowForm(true)}>
                  Create rule
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <DataTable<LoanRevenueRule & Record<string, unknown>>
          columns={[
            { key: 'name', header: 'Name', render: (r) => <strong>{r.name}</strong> },
            { key: 'lenderName', header: 'Lender' },
            { key: 'product', header: 'Product', render: (r) => getProductLabel(r.product) },
            {
              key: 'revenuePercent',
              header: 'Revenue %',
              render: (r) => `${Number(r.revenuePercent).toFixed(2)}%`,
            },
            {
              key: 'partnerSharePercent',
              header: 'Partner %',
              render: (r) => `${Number(r.partnerSharePercent).toFixed(1)}%`,
            },
            {
              key: 'isActive',
              header: 'Status',
              render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />,
            },
            {
              key: 'effectiveFrom',
              header: 'Effective',
              render: (r) => formatDate(r.effectiveFrom),
            },
            {
              key: 'actions',
              header: '',
              render: (r) =>
                canConfigure ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    loading={toggleActive.isPending}
                    onClick={() => toggleActive.mutate(r)}
                  >
                    {r.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                ) : null,
            },
          ]}
          data={items as (LoanRevenueRule & Record<string, unknown>)[]}
        />
      )}
    </div>
  );
}
