import { useQuery } from '@tanstack/react-query';
import { Briefcase, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../loan-fulfillment.css';
import { canLoanFulfillmentAction, resolveLoanFulfillmentRole } from '../data/permissions';
import {
  getProductLabel,
  getStageLabel,
  isTerminalStage,
  PRODUCT_FILTER_OPTIONS,
  STAGE_FILTER_OPTIONS,
} from '../data/stages';
import type { LoanCase } from '../data/types';

import {
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  TableSkeleton,
} from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';
import { useAuth } from '@/hooks/usePermissions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { loanFulfillmentService } from '@/services/index';

export function LoanCasesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = resolveLoanFulfillmentRole({ roles: user?.roles, permissions: user?.permissions });
  const canCreate = canLoanFulfillmentAction(role, 'createCase');

  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [product, setProduct] = useState('');
  const [partner, setPartner] = useState('');
  const [city, setCity] = useState('');
  const [lenderName, setLenderName] = useState('');
  const [employee, setEmployee] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDebounce(search);
  const debouncedPartner = useDebounce(partner);
  const debouncedCity = useDebounce(city);
  const debouncedLender = useDebounce(lenderName);
  const debouncedEmployee = useDebounce(employee);
  const debouncedMinAmount = useDebounce(minAmount);
  const debouncedMaxAmount = useDebounce(maxAmount);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      stage: stage || undefined,
      product: product || undefined,
      partner: debouncedPartner || undefined,
      city: debouncedCity || undefined,
      lenderName: debouncedLender || undefined,
      employee: debouncedEmployee || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minAmount: debouncedMinAmount || undefined,
      maxAmount: debouncedMaxAmount || undefined,
    }),
    [
      debouncedSearch,
      stage,
      product,
      debouncedPartner,
      debouncedCity,
      debouncedLender,
      debouncedEmployee,
      fromDate,
      toDate,
      debouncedMinAmount,
      debouncedMaxAmount,
    ],
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    reset();
  }, [filters, reset]);

  const clearFilters = () => {
    setSearch('');
    setStage('');
    setProduct('');
    setPartner('');
    setCity('');
    setLenderName('');
    setEmployee('');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['loan-fulfillment', 'cases', page, limit, filters],
    queryFn: () =>
      loanFulfillmentService.listCases({
        page,
        limit,
        ...filters,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  });

  return (
    <div className="page-container loan-fulfillment">
      <PageHeader
        title="Loan Cases"
        subtitle="Search and manage fulfillment cases across the journey"
        actions={
          canCreate ? (
            <Button type="button" onClick={() => navigate('/loan-fulfillment/cases/new')}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Create Case
            </Button>
          ) : undefined
        }
      />

      <div className="lf-filters">
        <div className="lf-filter-bar filter-bar">
          <SearchInput value={search} onChange={setSearch} placeholder="Search case #, customer, mobile…" />
          <Select
            options={STAGE_FILTER_OPTIONS}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            label="Stage"
          />
          <Select
            options={PRODUCT_FILTER_OPTIONS}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            label="Product"
          />
          <div className="lf-filter-actions">
            <Button type="button" variant="secondary" onClick={() => setShowAdvanced((v) => !v)}>
              <SlidersHorizontal size={16} style={{ marginRight: 6 }} />
              Filters
              {activeFilterCount > 0 ? <span className="lf-filter-count">{activeFilterCount}</span> : null}
            </Button>
            {activeFilterCount > 0 ? (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X size={16} style={{ marginRight: 4 }} />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {showAdvanced ? (
          <div className="lf-filter-advanced">
            <div className="form-group">
              <label className="form-label" htmlFor="lf-partner-filter">
                Financial Partner
              </label>
              <input
                id="lf-partner-filter"
                className="form-input"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="Partner name / ID"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-employee-filter">
                Financial Professional
              </label>
              <input
                id="lf-employee-filter"
                className="form-input"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                placeholder="Professional name / ID"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-lender-filter">
                Lender
              </label>
              <input
                id="lf-lender-filter"
                className="form-input"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                placeholder="Bank / NBFC"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-city-filter">
                City
              </label>
              <input
                id="lf-city-filter"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-from-filter">
                Created from
              </label>
              <input
                id="lf-from-filter"
                type="date"
                className="form-input"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-to-filter">
                Created to
              </label>
              <input
                id="lf-to-filter"
                type="date"
                className="form-input"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-min-filter">
                Min amount
              </label>
              <input
                id="lf-min-filter"
                type="number"
                min={0}
                className="form-input"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lf-max-filter">
                Max amount
              </label>
              <input
                id="lf-max-filter"
                type="number"
                min={0}
                className="form-input"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="No limit"
              />
            </div>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : isError ? (
        <div className="lf-empty">
          <EmptyState
            icon={<Briefcase size={32} />}
            title="Failed to load cases"
            description="Could not reach the loan fulfillment API."
            action={
              <Button type="button" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : (data?.items.length ?? 0) === 0 ? (
        <div className="lf-empty">
          <EmptyState
            icon={<Briefcase size={32} />}
            title="No loan cases yet"
            description={
              activeFilterCount > 0
                ? 'No cases match these filters. Try widening your search.'
                : 'Create a case to start tracking fulfillment.'
            }
            action={
              activeFilterCount > 0 ? (
                <Button type="button" variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : canCreate ? (
                <Button type="button" onClick={() => navigate('/loan-fulfillment/cases/new')}>
                  Create Case
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <DataTable<LoanCase & Record<string, unknown>>
            columns={[
              {
                key: 'caseNumber',
                header: 'Case #',
                render: (r) => <strong>{r.caseNumber}</strong>,
              },
              { key: 'customerName', header: 'Customer' },
              {
                key: 'product',
                header: 'Product',
                render: (r) => getProductLabel(r.product),
              },
              { key: 'lenderName', header: 'Lender' },
              {
                key: 'partnerName',
                header: 'Partner',
                render: (r) => String(r.partnerName ?? r.partnerId ?? '—'),
              },
              {
                key: 'city',
                header: 'City',
                render: (r) => String(r.city ?? '—'),
              },
              {
                key: 'loanAmount',
                header: 'Amount',
                render: (r) => formatCurrency(r.loanAmount),
              },
              {
                key: 'stage',
                header: 'Stage',
                render: (r) => (
                  <span
                    className={`lf-stage-pill${
                      isTerminalStage(r.stage) && r.stage !== 'COMPLETED'
                        ? ' lf-stage-pill--terminal'
                        : r.stage === 'COMPLETED'
                          ? ' lf-stage-pill--done'
                          : ''
                    }`}
                  >
                    {getStageLabel(r.stage)}
                  </span>
                ),
              },
              {
                key: 'updatedAt',
                header: 'Updated',
                render: (r) => formatDate(r.updatedAt),
              },
            ]}
            data={(data?.items ?? []) as (LoanCase & Record<string, unknown>)[]}
            onRowClick={(row) => navigate(`/loan-fulfillment/cases/${row.id}`)}
          />
          {data?.meta ? <Pagination meta={data.meta} onPageChange={setPage} /> : null}
        </>
      )}
    </div>
  );
}
