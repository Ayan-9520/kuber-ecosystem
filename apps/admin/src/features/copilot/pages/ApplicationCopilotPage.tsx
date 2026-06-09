import { useParams } from 'react-router-dom';

import { CopilotApplicationPanel } from '../components/CopilotApplicationPanel';

import { PageHeader } from '@/components/ui';

export function ApplicationCopilotPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className="page-container">
      <PageHeader title="Application AI Recommendations" subtitle={`Copilot analysis for application ${id}`} />
      <CopilotApplicationPanel applicationId={id} />
    </div>
  );
}
