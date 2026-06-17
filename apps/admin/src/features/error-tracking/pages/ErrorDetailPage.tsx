import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { errorTrackingService } from '@/services/error-tracking.service';

import '../error-tracking.css';

export function ErrorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['errors', 'detail', id],
    queryFn: () => errorTrackingService.getById(id!),
    enabled: !!id,
  });

  const resolveMut = useMutation({
    mutationFn: () => errorTrackingService.resolve({ groupId: id!, resolutionType: 'FIXED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['errors'] }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <div>Error not found</div>;

  const group = data as Record<string, unknown>;
  const occurrences = (group.occurrences as Record<string, unknown>[]) ?? [];
  const comments = (group.comments as Record<string, unknown>[]) ?? [];
  const resolutions = (group.resolutions as Record<string, unknown>[]) ?? [];

  return (
    <div className="error-tracking-hub">
      <PageHeader
        title={fieldStr(group, 'title').slice(0, 100)}
        subtitle={`${fieldStr(group, 'source')} · ${fieldStr(group, 'category')} · ${fieldStr(group, 'occurrenceCount')} occurrences`}
      />

      <div className="detail-grid mb-4">
        <StatCard label="Priority" value={fieldStr(group, 'priority')} />
        <StatCard label="Status" value={fieldStr(group, 'status')} />
        <StatCard label="Module" value={fieldStr(group, 'module') || '—'} />
        <StatCard label="Environment" value={fieldStr(group, 'environment')} />
        <StatCard label="First Seen" value={formatDateTime(fieldStr(group, 'firstSeenAt'))} />
        <StatCard label="Last Seen" value={formatDateTime(fieldStr(group, 'lastSeenAt'))} />
      </div>

      <div className="flex gap-2 mb-4">
        <StatusBadge status={fieldStr(group, 'status')} />
        <StatusBadge status={fieldStr(group, 'priority')} />
        {fieldStr(group, 'traceIdSample') && (
          <span className="mono">Trace: {fieldStr(group, 'traceIdSample').slice(0, 16)}</span>
        )}
        <CanAccess permission={['errors.resolve']}>
          {!['RESOLVED', 'CLOSED'].includes(fieldStr(group, 'status')) && (
            <Button size="sm" onClick={() => resolveMut.mutate()}>Resolve</Button>
          )}
        </CanAccess>
      </div>

      <Card title="Message" className="mb-4">
        <pre className="mono whitespace-pre-wrap text-sm">{fieldStr(group, 'message')}</pre>
      </Card>

      {fieldStr(group, 'stackSignature') && (
        <Card title="Stack Signature" className="mb-4">
          <pre className="mono whitespace-pre-wrap text-sm">{fieldStr(group, 'stackSignature')}</pre>
        </Card>
      )}

      <Card title="Root Cause Analysis Links" className="mb-4">
        <div className="space-y-1 text-sm">
          {fieldStr(group, 'traceIdSample') && <p>Trace ID: <span className="mono">{fieldStr(group, 'traceIdSample')}</span> → <a href={`/observability?trace=${fieldStr(group, 'traceIdSample')}`} className="text-blue-600">Open in Trace Explorer</a></p>}
          <p>Logs → <a href="/observability" className="text-blue-600">Log Explorer</a></p>
          <p>Monitoring → <a href="/monitoring" className="text-blue-600">Production Monitoring</a></p>
        </div>
      </Card>

      <Card title="Recent Occurrences" className="mb-4">
        {occurrences.length === 0 ? <p className="text-sm text-gray-500">No occurrences</p> : (
          <ul className="space-y-2">
            {occurrences.map((o) => {
              const event = (o.event as Record<string, unknown>) ?? {};
              return (
                <li key={fieldStr(o, 'id')} className="text-sm border-b pb-2">
                  <span className="mono">{formatDateTime(fieldStr(o, 'createdAt'))}</span>
                  {' · '}{fieldStr(event, 'path') || fieldStr(event, 'errorType')}
                  {fieldStr(event, 'statusCode') && ` · ${fieldStr(event, 'statusCode')}`}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Resolution Center" className="mb-4">
        {resolutions.length === 0 ? <p className="text-sm text-gray-500">Not resolved yet</p> : (
          resolutions.map((r) => (
            <div key={fieldStr(r, 'id')} className="text-sm mb-2">
              <strong>{fieldStr(r, 'resolutionType')}</strong> — MTTR: {fieldStr(r, 'mttrMinutes')}min
              {fieldStr(r, 'rootCause') && <p>{fieldStr(r, 'rootCause')}</p>}
            </div>
          ))
        )}
      </Card>

      <Card title="Comments">
        {comments.map((c) => (
          <div key={fieldStr(c, 'id')} className="text-sm mb-2 border-b pb-2">
            <span className="text-gray-500">{formatDateTime(fieldStr(c, 'createdAt'))}</span>
            <p>{fieldStr(c, 'content')}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
