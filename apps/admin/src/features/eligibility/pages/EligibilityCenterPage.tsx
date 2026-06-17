import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, Card, Input, PageHeader, Select, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { applicationsService, eligibilityService } from '@/services';

type TabId = 'calculator' | 'results' | 'rules';

const TABS: { id: TabId; label: string }[] = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'results', label: 'Results History' },
  { id: 'rules', label: 'Eligibility Rules' },
];

const EMPLOYMENT_OPTIONS = [
  { value: 'SALARIED', label: 'Salaried' },
  { value: 'SELF_EMPLOYED', label: 'Self Employed' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'OTHER', label: 'Other' },
];

const PRODUCT_OPTIONS = [
  { value: 'HOME_LOAN', label: 'Home Loan' },
  { value: 'LAP', label: 'Loan Against Property' },
  { value: 'BUSINESS_LOAN', label: 'Business Loan' },
  { value: 'NEW_CAR_LOAN', label: 'Car Loan' },
];

export function EligibilityCenterPage() {
  const [tab, setTab] = useState<TabId>('calculator');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const [form, setForm] = useState({
    productSlug: 'HOME_LOAN',
    monthlyIncome: '',
    employmentType: 'SALARIED',
    creditScore: '',
    requestedLoanAmount: '',
    existingObligations: '0',
  });

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const calculateMutation = useMutation({
    mutationFn: () =>
      eligibilityService.calculate({
        productSlug: form.productSlug,
        monthlyIncome: Number(form.monthlyIncome),
        employmentType: form.employmentType,
        creditScore: form.creditScore ? Number(form.creditScore) : undefined,
        requestedLoanAmount: form.requestedLoanAmount ? Number(form.requestedLoanAmount) : undefined,
        existingObligations: Number(form.existingObligations || 0),
        persist: true,
      }),
  });

  const resultsQuery = useQuery({
    queryKey: ['eligibility-results', page, limit, debouncedSearch],
    queryFn: () =>
      applicationsService.eligibility({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: tab === 'results',
  });

  const rulesQuery = useQuery({
    queryKey: ['eligibility-rules', page, limit, debouncedSearch],
    queryFn: () =>
      eligibilityService.rules({
        page,
        limit,
        search: debouncedSearch || undefined,
      }),
    enabled: tab === 'rules',
  });

  const result = calculateMutation.data;
  const listData = tab === 'results' ? resultsQuery.data : rulesQuery.data;
  const listLoading = tab === 'results' ? resultsQuery.isLoading : rulesQuery.isLoading;

  const resultColumns = [
    { key: 'applicationId', header: 'Application', render: (r: Record<string, unknown>) => fieldStr(r, 'applicationId') },
    { key: 'productName', header: 'Product', render: (r: Record<string, unknown>) => fieldStr(r, 'productName') },
    { key: 'eligibleAmount', header: 'Eligible Amount', render: (r: Record<string, unknown>) => formatCurrency(r.eligibleAmount as number) },
    { key: 'outcome', header: 'Outcome', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'outcome')} /> },
    { key: 'createdAt', header: 'Checked', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
  ];

  const ruleColumns = [
    { key: 'ruleName', header: 'Rule', render: (r: Record<string, unknown>) => fieldStr(r, 'ruleName') || fieldStr(r, 'name') },
    { key: 'ruleType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'ruleType') },
    { key: 'productName', header: 'Product', render: (r: Record<string, unknown>) => fieldStr(r, 'productName') },
    { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive === false ? 'CLOSED' : 'APPROVED'} /> },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Eligibility Center" subtitle="Run eligibility checks, review results, and manage rules" />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'calculator' && (
        <>
          <Card title="Eligibility Calculator" className="mb-4">
            <div className="form-grid" style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
              <Select
                label="Product"
                options={PRODUCT_OPTIONS}
                value={form.productSlug}
                onChange={(e) => setForm({ ...form, productSlug: e.target.value })}
              />
              <Input
                label="Monthly Income (₹)"
                value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                type="number"
              />
              <Select
                label="Employment Type"
                options={EMPLOYMENT_OPTIONS}
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              />
              <Input
                label="Credit Score"
                value={form.creditScore}
                onChange={(e) => setForm({ ...form, creditScore: e.target.value })}
                type="number"
              />
              <Input
                label="Requested Loan Amount (₹)"
                value={form.requestedLoanAmount}
                onChange={(e) => setForm({ ...form, requestedLoanAmount: e.target.value })}
                type="number"
              />
              <Input
                label="Existing Obligations (₹)"
                value={form.existingObligations}
                onChange={(e) => setForm({ ...form, existingObligations: e.target.value })}
                type="number"
              />
              <div>
                <Button
                  variant="primary"
                  disabled={!form.monthlyIncome || calculateMutation.isPending}
                  onClick={() => calculateMutation.mutate()}
                >
                  {calculateMutation.isPending ? 'Calculating…' : 'Calculate Eligibility'}
                </Button>
              </div>
            </div>
          </Card>

          {result && (
            <div className="stat-grid">
              <StatCard label="Eligible Amount" value={formatCurrency(result.eligibleAmount as number)} />
              <StatCard label="Approval Probability" value={formatPercent((Number(result.approvalProbability) || 0) * 100)} />
              <StatCard label="Outcome" value={fieldStr(result, 'outcome')} />
              <StatCard label="FOIR" value={result.foir != null ? formatPercent(Number(result.foir) * 100) : '—'} />
            </div>
          )}
        </>
      )}

      {tab !== 'calculator' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={tab === 'results' ? 'Search eligibility results...' : 'Search rules...'}
          isLoading={listLoading}
          data={listData?.items ?? []}
          meta={listData?.meta}
          onPageChange={setPage}
          columns={tab === 'results' ? resultColumns : ruleColumns}
          emptyTitle={tab === 'results' ? 'No eligibility results' : 'No eligibility rules'}
          emptyDescription="Records will appear as eligibility checks are run."
        />
      )}
    </div>
  );
}
