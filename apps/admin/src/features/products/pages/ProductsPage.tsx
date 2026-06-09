import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatCurrency, formatDate } from '@/lib/utils';
import { productsService } from '@/services';

type TabId =
  | 'families'
  | 'products'
  | 'variants'
  | 'eligibility'
  | 'documents'
  | 'lenders'
  | 'policies';

const TABS: { id: TabId; label: string }[] = [
  { id: 'families', label: 'Families' },
  { id: 'products', label: 'Products' },
  { id: 'variants', label: 'Variants' },
  { id: 'eligibility', label: 'Eligibility Rules' },
  { id: 'documents', label: 'Document Rules' },
  { id: 'lenders', label: 'Lenders' },
  { id: 'policies', label: 'Lender Policies' },
];

const FETCHERS: Record<TabId, (params: Record<string, unknown>) => ReturnType<typeof productsService.families>> = {
  families: productsService.families,
  products: productsService.list,
  variants: productsService.variants,
  eligibility: productsService.eligibilityRules,
  documents: productsService.documentRules,
  lenders: productsService.lenders,
  policies: productsService.lenderPolicies,
};

function activeBadge(isActive: unknown) {
  return isActive === false || isActive === 'false' ? (
    <StatusBadge status="CLOSED" />
  ) : (
    <StatusBadge status="APPROVED" />
  );
}

export function ProductsPage() {
  const [tab, setTab] = useState<TabId>('families');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['products', tab, params],
    queryFn: () => FETCHERS[tab](params),
  });

  const columns = useMemo(() => {
    switch (tab) {
      case 'families':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          {
            key: 'isSecured',
            header: 'Secured',
            render: (r: Record<string, unknown>) => (r.isSecured ? 'Yes' : 'No'),
          },
          { key: 'displayOrder', header: 'Order', render: (r: Record<string, unknown>) => fieldStr(r, 'displayOrder') },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => activeBadge(r.isActive) },
        ];
      case 'products':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => fieldStr(r, 'priority') },
          {
            key: 'minAmount',
            header: 'Amount Range',
            render: (r: Record<string, unknown>) =>
              `${formatCurrency(r.minAmount as number)} – ${formatCurrency(r.maxAmount as number)}`,
          },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => activeBadge(r.isActive) },
        ];
      case 'variants':
        return [
          { key: 'variantCode', header: 'Variant', render: (r: Record<string, unknown>) => fieldStr(r, 'variantCode') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'productId', header: 'Product ID', render: (r: Record<string, unknown>) => fieldStr(r, 'productId') },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => activeBadge(r.isActive) },
        ];
      case 'eligibility':
        return [
          { key: 'ruleName', header: 'Rule', render: (r: Record<string, unknown>) => fieldStr(r, 'ruleName') },
          { key: 'ruleType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'ruleType') },
          { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => fieldStr(r, 'priority') },
          {
            key: 'effectiveFrom',
            header: 'Effective',
            render: (r: Record<string, unknown>) => formatDate(r.effectiveFrom as string),
          },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => activeBadge(r.isActive) },
        ];
      case 'documents':
        return [
          { key: 'productId', header: 'Product', render: (r: Record<string, unknown>) => fieldStr(r, 'productId') },
          { key: 'documentTypeId', header: 'Doc Type', render: (r: Record<string, unknown>) => fieldStr(r, 'documentTypeId') },
          { key: 'stage', header: 'Stage', render: (r: Record<string, unknown>) => fieldStr(r, 'stage') },
          {
            key: 'isMandatory',
            header: 'Mandatory',
            render: (r: Record<string, unknown>) => (r.isMandatory ? 'Yes' : 'No'),
          },
        ];
      case 'lenders':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'lenderType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'lenderType') },
          {
            key: 'integrationType',
            header: 'Integration',
            render: (r: Record<string, unknown>) => fieldStr(r, 'integrationType'),
          },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => activeBadge(r.isActive) },
        ];
      case 'policies':
        return [
          { key: 'lenderId', header: 'Lender', render: (r: Record<string, unknown>) => fieldStr(r, 'lenderId') },
          { key: 'productId', header: 'Product', render: (r: Record<string, unknown>) => fieldStr(r, 'productId') },
          {
            key: 'minAmount',
            header: 'Amount Range',
            render: (r: Record<string, unknown>) =>
              `${formatCurrency(r.minAmount as number)} – ${formatCurrency(r.maxAmount as number)}`,
          },
          {
            key: 'effectiveFrom',
            header: 'Effective',
            render: (r: Record<string, unknown>) => formatDate(r.effectiveFrom as string),
          },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => activeBadge(r.isActive) },
        ];
      default:
        return [];
    }
  }, [tab]);

  const emptyTitles: Record<TabId, string> = {
    families: 'No product families',
    products: 'No products found',
    variants: 'No variants found',
    eligibility: 'No eligibility rules',
    documents: 'No document rules',
    lenders: 'No lenders found',
    policies: 'No lender policies',
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, eligibility, document rules, and lender mappings"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${TABS.find((t) => t.id === tab)?.label?.toLowerCase()}...`}
        isLoading={isLoading}
        data={data?.items ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle={emptyTitles[tab]}
        emptyDescription="Try adjusting your search or add new catalog entries from the backend."
      />
    </div>
  );
}
