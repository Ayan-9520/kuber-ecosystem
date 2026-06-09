import { useNavigate } from 'react-router-dom';

import { Button, EmptyState } from '@/components/ui';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container not-found-page">
      <EmptyState
        title="Page not found"
        description="The page you requested does not exist or you may not have access."
        action={<Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>}
      />
      <div className="not-found-actions">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    </div>
  );
}
