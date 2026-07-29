import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
  TableSkeleton,
} from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';
import { formatDate, formatCurrency } from '@/lib/utils';
import { leadsService } from '@/services/index';

const GRADE_OPTIONS = [
  { value: '', label: 'All Grades' },
  { value: 'A_PLUS', label: 'A+ (Premium)' },
  { value: 'A', label: 'A (High Quality)' },
  { value: 'B', label: 'B (Moderate)' },
  { value: 'C', label: 'C (Low Quality)' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'DOCUMENT_PENDING', label: 'Document Pending' },
  { value: 'IN_PROCESS', label: 'In Process' },
  { value: 'APPLICATION_CREATED', label: 'Application Created' },
  { value: 'SANCTIONED', label: 'Sanctioned' },
  { value: 'DISBURSED', label: 'Disbursed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'LOST', label: 'Lost' },
];

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const LOAN_TYPE_OPTIONS = [
  { value: '', label: 'Select Loan Type' },
  { value: 'HOME_LOAN', label: 'Home Loan' },
  { value: 'BUSINESS_LOAN', label: 'Business Loan' },
  { value: 'LAP', label: 'LAP' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select Employment Type' },
  { value: 'SALARIED', label: 'Salaried' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'BUSINESS', label: 'Business' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'Select Source' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'PARTNER_REFERRAL', label: 'Partner Referral' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'PHONE_CALL', label: 'Phone Call' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
];

const INITIAL_FORM = {
  customerName: '',
  phone: '',
  email: '',
  loanType: '',
  requestedAmount: '',
  employmentType: '',
  monthlyIncome: '',
  city: '',
  source: '',
  partnerId: '',
  notes: '',
};

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function LeadsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { page, limit, setPage, reset } = usePagination();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [grade, setGrade] = useState(searchParams.get('grade') ?? '');
  const [fromDate, setFromDate] = useState<string | undefined>(() => {
    if (searchParams.get('preset') === 'today') return startOfTodayIso();
    return searchParams.get('fromDate') ?? undefined;
  });
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setStatus(searchParams.get('status') ?? '');
    setGrade(searchParams.get('grade') ?? '');
    if (searchParams.get('preset') === 'today') {
      setFromDate(startOfTodayIso());
    } else {
      setFromDate(searchParams.get('fromDate') ?? undefined);
    }
    reset();
  }, [searchParams, reset]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, grade, fromDate, reset]);

  const setField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.customerName.trim()) errors.customerName = 'Name is required';
    if (!form.phone.trim()) errors.phone = 'Phone is required';
    if (!form.loanType) errors.loanType = 'Loan type is required';
    if (!form.requestedAmount || Number(form.requestedAmount) <= 0)
      errors.requestedAmount = 'Valid amount is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => leadsService.create(data),
    onSuccess: () => {
      setShowCreateForm(false);
      setForm(INITIAL_FORM);
      setFormErrors({});
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const handleCreateSubmit = () => {
    if (!validateForm()) return;
    createMutation.mutate({
      fullName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      loanType: form.loanType || undefined,
      requestedAmount: Number(form.requestedAmount),
      employmentType: form.employmentType || undefined,
      monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
      city: form.city.trim() || undefined,
      sourceCode: form.source || undefined,
      partnerId: form.partnerId.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads', page, limit, debouncedSearch, status, grade, fromDate],
    queryFn: () =>
      leadsService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        grade: grade || undefined,
        fromDate: fromDate || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  return (
    <div className="page-container">
      <PageHeader
        title="Leads"
        subtitle="Manage and track sales leads across branches"
        actions={
          <>
            <Button onClick={() => setShowCreateForm((v) => !v)}>
              {showCreateForm ? 'Cancel' : 'Create Lead'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/leads/visitors')}>
              Website Visitors
            </Button>
            <Button variant="secondary" onClick={() => navigate('/leads/scoring-analytics')}>
              Scoring Analytics
            </Button>
            <Button variant="secondary" onClick={() => navigate('/leads/analytics')}>
              View Analytics
            </Button>
          </>
        }
      />

      {showCreateForm && (
        <Card title="Create New Lead" className="mb-4">
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', padding: '1rem' }}>
            <Input
              label="Customer Name *"
              value={form.customerName}
              onChange={(e) => setField('customerName', e.target.value)}
              error={formErrors.customerName}
              placeholder="Full name"
            />
            <Input
              label="Phone *"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              error={formErrors.phone}
              placeholder="Phone number"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="Email address"
            />
            <Select
              label="Loan Type *"
              options={LOAN_TYPE_OPTIONS}
              value={form.loanType}
              onChange={(e) => setField('loanType', e.target.value)}
              error={formErrors.loanType}
            />
            <Input
              label="Requested Amount *"
              type="number"
              value={form.requestedAmount}
              onChange={(e) => setField('requestedAmount', e.target.value)}
              error={formErrors.requestedAmount}
              placeholder="Amount in ₹"
            />
            <Select
              label="Employment Type"
              options={EMPLOYMENT_TYPE_OPTIONS}
              value={form.employmentType}
              onChange={(e) => setField('employmentType', e.target.value)}
            />
            <Input
              label="Monthly Income"
              type="number"
              value={form.monthlyIncome}
              onChange={(e) => setField('monthlyIncome', e.target.value)}
              placeholder="Monthly income in ₹"
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              placeholder="City"
            />
            <Select
              label="Source"
              options={SOURCE_OPTIONS}
              value={form.source}
              onChange={(e) => setField('source', e.target.value)}
            />
            <Input
              label="Assign to Partner"
              value={form.partnerId}
              onChange={(e) => setField('partnerId', e.target.value)}
              placeholder="Partner ID"
            />
          </div>
          <div style={{ padding: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="create-lead-notes">Notes</label>
              <textarea
                id="create-lead-notes"
                className="form-input"
                rows={3}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '1rem' }}>
            {createMutation.isError && (
              <span className="form-error" style={{ marginRight: 'auto' }}>
                Failed to create lead. Please try again.
              </span>
            )}
            <Button variant="secondary" onClick={() => { setShowCreateForm(false); setForm(INITIAL_FORM); setFormErrors({}); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </Card>
      )}

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        />
        <Select
          options={GRADE_OPTIONS}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          aria-label="Filter by grade"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState title="Failed to load leads" description="Please try again later." />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No leads found"
          description={debouncedSearch || status ? 'Try adjusting your filters.' : 'New leads will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'leadNumber', header: 'Lead #', render: (r) => str(r.leadNumber ?? r.id) },
              { key: 'fullName', header: 'Name', render: (r) => str(r.fullName ?? r.prospectName ?? r.name) },
              { key: 'phone', header: 'Phone', render: (r) => str(r.phone ?? r.prospectPhone) },
              { key: 'loanAmount', header: 'Amount', render: (r) => formatCurrency((r.loanAmount ?? r.requestedAmount) as number) },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge status={str(r.status)} />,
              },
              { key: 'grade', header: 'Grade', render: (r) => str(r.grade ?? r.gradeAlias) },
              { key: 'source', header: 'Source', render: (r) => str(r.sourceName ?? r.sourceCode) },
              { key: 'score', header: 'Score', render: (r) => str(r.score) },
              { key: 'priority', header: 'Priority', render: (r) => str(r.priority) },
              { key: 'createdAt', header: 'Created', render: (r) => formatDate(r.createdAt as string) },
            ]}
            data={data?.items ?? []}
            onRowClick={(row) => navigate(`/leads/${row.id}`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
