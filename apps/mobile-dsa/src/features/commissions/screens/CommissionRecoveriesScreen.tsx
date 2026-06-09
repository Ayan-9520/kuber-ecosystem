import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';

export function CommissionRecoveriesScreen() {
  const { partnerId } = useAuth();

  const recoveries = useQuery({
    queryKey: ['commission-recoveries', partnerId],
    queryFn: () => commissionsService.recoveries({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  return (
    <Screen scroll title="Commission Recoveries">
      <Card>
        {recoveries.isError ? (
          <EmptyState title="Failed to load recoveries" description={getApiErrorMessage(recoveries.error)} />
        ) : (recoveries.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No recoveries" description="Clawbacks and adjustments appear here" />
        ) : (
          recoveries.data?.items.map((r) => (
            <ListRow
              key={String(r.id)}
              title={str(r.reason ?? r.recoveryType)}
              subtitle={`${formatCurrency(r.amount as number)} · ${formatDate(r.createdAt as string)}`}
              status={str(r.status)}
              icon="arrow-undo"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
