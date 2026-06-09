import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, DataTable, LoadingSpinner, PageHeader } from '@/components/ui';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeTagsPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [tagGroup, setTagGroup] = useState('products');

  const tags = useQuery({
    queryKey: ['knowledge-tags'],
    queryFn: () => knowledgeService.tags({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => knowledgeService.createTag({ code, name, tagGroup }),
    onSuccess: () => {
      setCode('');
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] });
    },
  });

  if (tags.isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <PageHeader title="Tag Management" subtitle="Tag articles by products, lenders, departments, and processes" />

      <Card title="Add Tag">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="info-item-label">Code</label>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div>
            <label className="info-item-label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="info-item-label">Group</label>
            <select className="input" value={tagGroup} onChange={(e) => setTagGroup(e.target.value)}>
              {['products', 'lenders', 'departments', 'processes', 'policies', 'risk'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!code || !name}>Add</Button>
        </div>
      </Card>

      <Card title="Tags" className="detail-section">
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'tagGroup', label: 'Group' },
          ]}
          data={(tags.data?.items ?? []) as Record<string, unknown>[]}
        />
      </Card>
    </div>
  );
}
