import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, Input, PageHeader, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDate } from '@/lib/utils';
import { branchesService } from '@/services';

type TabId = 'branches' | 'regions';
type DrawerMode = 'create-branch' | 'edit-branch' | 'create-region' | 'edit-region' | null;

const TABS: { id: TabId; label: string }[] = [
  { id: 'branches', label: 'Branches' },
  { id: 'regions', label: 'Regions' },
];

const EMPTY_BRANCH = { regionId: '', code: '', name: '', city: '', state: '', pincode: '' };
const EMPTY_REGION = { code: '', name: '' };

export function BranchesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('branches');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState(EMPTY_BRANCH);
  const [regionForm, setRegionForm] = useState(EMPTY_REGION);

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: tab === 'branches' ? 'name' : 'name',
      sortOrder: 'asc',
    }),
    [page, limit, debouncedSearch, tab],
  );

  const branchesQuery = useQuery({
    queryKey: ['branches', params],
    queryFn: () => branchesService.list(params),
    enabled: tab === 'branches',
  });

  const regionsQuery = useQuery({
    queryKey: ['regions', params],
    queryFn: () => branchesService.regions(params),
    enabled: tab === 'regions',
  });

  const branchDetail = useQuery({
    queryKey: ['branches', selectedId],
    queryFn: () => branchesService.getById(selectedId!),
    enabled: !!selectedId && drawerMode === 'edit-branch',
  });

  useEffect(() => {
    if (branchDetail.data && drawerMode === 'edit-branch') {
      const d = branchDetail.data;
      setBranchForm({
        regionId: fieldStr(d, 'regionId'),
        code: fieldStr(d, 'code'),
        name: fieldStr(d, 'name'),
        city: fieldStr(d, 'city'),
        state: fieldStr(d, 'state'),
        pincode: fieldStr(d, 'pincode'),
      });
    }
  }, [branchDetail.data, drawerMode]);

  const saveBranchMutation = useMutation({
    mutationFn: () =>
      drawerMode === 'edit-branch' && selectedId
        ? branchesService.update(selectedId, branchForm)
        : branchesService.create(branchForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setDrawerMode(null);
      setSelectedId(null);
      setBranchForm(EMPTY_BRANCH);
    },
  });

  const saveRegionMutation = useMutation({
    mutationFn: () =>
      drawerMode === 'edit-region' && selectedId
        ? branchesService.updateRegion(selectedId, regionForm)
        : branchesService.createRegion(regionForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setDrawerMode(null);
      setSelectedId(null);
      setRegionForm(EMPTY_REGION);
    },
  });

  const regionName = (regionId: string) => {
    const region = regionsQuery.data?.items?.find((r) => String(r.id) === regionId);
    return region ? fieldStr(region, 'name') : regionId;
  };

  const branchColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'city', header: 'City', render: (r: Record<string, unknown>) => fieldStr(r, 'city') },
    { key: 'regionId', header: 'Region', render: (r: Record<string, unknown>) => regionName(fieldStr(r, 'regionId')) },
    {
      key: 'isActive',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive === false ? 'CLOSED' : 'APPROVED'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: Record<string, unknown>) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(String(r.id));
            setDrawerMode('edit-branch');
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const regionColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    {
      key: 'isActive',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive === false ? 'CLOSED' : 'APPROVED'} />,
    },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: Record<string, unknown>) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(String(r.id));
            setRegionForm({ code: fieldStr(r, 'code'), name: fieldStr(r, 'name') });
            setDrawerMode('edit-region');
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const data = tab === 'branches' ? branchesQuery.data : regionsQuery.data;
  const isLoading = tab === 'branches' ? branchesQuery.isLoading : regionsQuery.isLoading;

  return (
    <div className="page-container">
      <PageHeader
        title="Branches & Regions"
        subtitle="Manage branch network and regional hierarchy"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setSelectedId(null);
              if (tab === 'branches') {
                setBranchForm(EMPTY_BRANCH);
                setDrawerMode('create-branch');
              } else {
                setRegionForm(EMPTY_REGION);
                setDrawerMode('create-region');
              }
            }}
          >
            {tab === 'branches' ? 'Add Branch' : 'Add Region'}
          </Button>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      <Card title={tab === 'branches' ? 'Branch Directory' : 'Region Directory'} className="mb-4">
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={`Search ${tab}...`}
          isLoading={isLoading}
          data={data?.items ?? []}
          meta={data?.meta}
          onPageChange={setPage}
          columns={tab === 'branches' ? branchColumns : regionColumns}
          emptyTitle={tab === 'branches' ? 'No branches found' : 'No regions found'}
          emptyDescription="Organization records will appear here."
        />
      </Card>

      <DetailDrawer
        open={drawerMode !== null}
        title={
          drawerMode === 'create-branch'
            ? 'Create Branch'
            : drawerMode === 'edit-branch'
              ? 'Edit Branch'
              : drawerMode === 'create-region'
                ? 'Create Region'
                : 'Edit Region'
        }
        onClose={() => {
          setDrawerMode(null);
          setSelectedId(null);
        }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="primary"
              disabled={
                (drawerMode?.includes('branch') && (!branchForm.code || !branchForm.name || !branchForm.regionId)) ||
                (drawerMode?.includes('region') && (!regionForm.code || !regionForm.name)) ||
                saveBranchMutation.isPending ||
                saveRegionMutation.isPending
              }
              onClick={() => (drawerMode?.includes('branch') ? saveBranchMutation.mutate() : saveRegionMutation.mutate())}
            >
              Save
            </Button>
            <Button variant="secondary" onClick={() => setDrawerMode(null)}>
              Cancel
            </Button>
          </div>
        }
      >
        {drawerMode?.includes('branch') ? (
          <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
            <Input label="Region ID" value={branchForm.regionId} onChange={(e) => setBranchForm({ ...branchForm, regionId: e.target.value })} />
            <Input label="Branch Code" value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} />
            <Input label="Branch Name" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} />
            <Input label="City" value={branchForm.city} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} />
            <Input label="State" value={branchForm.state} onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })} />
            <Input label="Pincode" value={branchForm.pincode} onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })} />
          </div>
        ) : (
          <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
            <Input label="Region Code" value={regionForm.code} onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value })} />
            <Input label="Region Name" value={regionForm.name} onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })} />
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
