import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

import { monitoringService } from '@/services/monitoring.service';

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export function DeploymentWarningsBanner() {
  const readiness = useQuery({
    queryKey: ['monitoring', 'deployment-readiness'],
    queryFn: () => monitoringService.deploymentReadiness(),
    staleTime: 60_000,
    retry: 1,
  });

  const data = readiness.data as Record<string, unknown> | undefined;
  const summary = (data?.summary ?? {}) as Record<string, unknown>;
  const warnings = (data?.warnings ?? []) as string[];
  const channels = (data?.channels ?? []) as Array<Record<string, unknown>>;
  const rolloutPhase = str(data?.rolloutPhase) || 'staged';
  const publicLaunchReady = Boolean(summary.publicLaunchReady);
  const stagedPercent = Number(summary.stagedReadinessPercent ?? 0);
  const publicPercent = Number(summary.publicLaunchReadinessPercent ?? 0);

  if (readiness.isLoading || readiness.isError || !data) return null;
  if (publicLaunchReady && warnings.length === 0) return null;

  const inactiveChannels = channels.filter((c) => str(c.status) !== 'Active');

  return (
    <details className="deployment-warnings-banner">
      <summary className="deployment-warnings-banner__summary">
        <span className="deployment-warnings-banner__icon" aria-hidden>
          <AlertTriangle size={18} />
        </span>
        <span>
          Deployment readiness: {stagedPercent}% staged · {publicPercent}% public launch
          {warnings.length > 0 ? ` · ${warnings.length} item(s)` : ''}
        </span>
      </summary>
      <div className="deployment-warnings-banner__content">
        <strong>
          Rollout phase: {rolloutPhase}
        </strong>
        {inactiveChannels.length > 0 && (
          <p>
            Notification channels:{' '}
            {inactiveChannels
              .map((c) => `${str(c.channel)}: ${str(c.status)}`)
              .join(' · ')}
          </p>
        )}
        {warnings.length > 0 && (
          <ul>
            {warnings.slice(0, 6).map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
