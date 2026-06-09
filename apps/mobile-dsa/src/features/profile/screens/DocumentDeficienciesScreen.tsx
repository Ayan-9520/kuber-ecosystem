import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { documentsService } from '@/services';

export function DocumentDeficienciesScreen() {
  const { partnerId } = useAuth();

  const deficiencies = useQuery({
    queryKey: ['document-deficiencies', partnerId],
    queryFn: () => documentsService.deficiencies({ partnerId, limit: 50, status: 'OPEN' }),
    enabled: !!partnerId,
  });

  return (
    <Screen scroll title="Document Deficiencies">
      <Card>
        {deficiencies.isError ? (
          <EmptyState title="Failed to load" description={getApiErrorMessage(deficiencies.error)} />
        ) : (deficiencies.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No deficiencies" description="All required documents are in order" />
        ) : (
          deficiencies.data?.items.map((d) => (
            <ListRow
              key={String(d.id)}
              title={str(d.deficiencyType ?? d.reason)}
              subtitle={`${str(d.documentTypeName)} · ${formatDate(d.createdAt as string)}`}
              status={str(d.status)}
              icon="alert-circle"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
