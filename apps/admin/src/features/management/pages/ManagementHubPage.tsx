import { useNavigate } from 'react-router-dom';

import { MANAGEMENT_TEAMS } from '../constants';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, PageHeader } from '@/components/ui';
import { usePermissions } from '@/hooks/usePermissions';

import '../management.css';

export function ManagementHubPage() {
  const navigate = useNavigate();
  const { user, hasPermission } = usePermissions();
  const isAdmin = user?.roles.includes('SUPER_ADMIN') || user?.roles.includes('ADMIN');

  const visibleTeams = MANAGEMENT_TEAMS.filter(
    (team) => isAdmin || team.permissions.some((p) => hasPermission(p)),
  );

  return (
    <div className="management-hub">
      <PageHeader
        title="Management"
        subtitle="Organizational teams — branch, regional, sales, credit, operations, compliance, support, and admin"
      />

      <Card title="Executive Overview">
        <p className="text-muted">
          Access team-specific dashboards and analytics. Management coordinates App Store launch briefings,
          TestFlight sign-off, and UAT stakeholder alignment across all teams below.
        </p>
        <CanAccess permission={['executive_analytics.read', 'analytics.read']}>
          <Button type="button" variant="secondary" onClick={() => navigate('/executive-analytics')}>
            Executive Analytics
          </Button>
        </CanAccess>
      </Card>

      <div className="management-teams">
        {visibleTeams.map((team) => (
          <Card key={team.id} title={team.label} className="management-team-card">
            <p>{team.description}</p>
            <Button type="button" variant="secondary" onClick={() => navigate(team.path)}>
              Open dashboard
            </Button>
          </Card>
        ))}
      </div>

      {visibleTeams.length === 0 && (
        <Card title="No team access">
          <p className="text-muted">Your role does not include management team dashboards. Contact your administrator.</p>
        </Card>
      )}
    </div>
  );
}
