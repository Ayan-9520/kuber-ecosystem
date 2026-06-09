import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, DataTable, LoadingSpinner, PageHeader } from '@/components/ui';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeCategoriesPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const categories = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => knowledgeService.categories({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => knowledgeService.createCategory({ code, name }),
    onSuccess: () => {
      setCode('');
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['knowledge-categories'] });
    },
  });

  if (categories.isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <PageHeader title="Category Management" subtitle="Organize knowledge by loan policies, scripts, FAQs, and more" />

      <Card title="Add Category">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="info-item-label">Code</label>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="HOME_LOAN" />
          </div>
          <div style={{ flex: 2 }}>
            <label className="info-item-label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Home Loan Policies" />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!code || !name}>Add</Button>
        </div>
      </Card>

      <Card title="Categories" className="detail-section">
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'articleCount', label: 'Articles' },
            { key: 'isActive', label: 'Active', render: (r) => r.isActive ? 'Yes' : 'No' },
          ]}
          data={(categories.data?.items ?? []) as Record<string, unknown>[]}
        />
      </Card>
    </div>
  );
}
