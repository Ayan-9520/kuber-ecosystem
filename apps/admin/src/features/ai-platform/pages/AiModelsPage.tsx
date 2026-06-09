import { useQuery } from '@tanstack/react-query';

import { Card, DataTable, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { aiPlatformService } from '@/services/ai-platform.service';

export function AiModelsPage() {
  const models = useQuery({ queryKey: ['ai-models'], queryFn: () => aiPlatformService.models() });

  if (models.isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <PageHeader title="Model Management" subtitle="GPT models, embeddings, transcription, and TTS routing" />
      <Card title="Active Models">
        <DataTable
          columns={[
            { key: 'name', label: 'Model' },
            { key: 'code', label: 'Code' },
            { key: 'capability', label: 'Capability' },
            { key: 'isDefault', label: 'Default', render: (r) => (r.isDefault ? 'Yes' : '—') },
            { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
          ]}
          data={(models.data?.items ?? []) as Record<string, unknown>[]}
        />
      </Card>
    </div>
  );
}
