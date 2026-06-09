import { useParams } from 'react-router-dom';

import { CopilotLeadPanel } from '../components/CopilotLeadPanel';

import { PageHeader } from '@/components/ui';

export function LeadCopilotPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className="page-container">
      <PageHeader title="Lead AI Recommendations" subtitle={`Copilot analysis for lead ${id}`} />
      <CopilotLeadPanel leadId={id} />
    </div>
  );
}
