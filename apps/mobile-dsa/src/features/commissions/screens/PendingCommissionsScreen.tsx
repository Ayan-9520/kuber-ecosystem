import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';

export function PendingCommissionsScreen() {
  const { partnerId } = useAuth();

  const pending = useQuery({
    queryKey: ['commission-pending-list', partnerId],
    queryFn: () => commissionsService.ledger({ partnerId, status: 'PENDING', limit: 50 }),
    enabled: !!partnerId,
  });

  return (
    <Screen scroll title="Pending Commissions">
      <Card subtitle={`${pending.data?.meta.total ?? 0} awaiting approval/payment`}>
        {pending.isError ? (
          <EmptyState title="Failed to load" description={getApiErrorMessage(pending.error)} />
        ) : (pending.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No pending commissions" description="All commissions are processed" />
        ) : (
          pending.data?.items.map((entry) => (
            <ListRow
              key={String(entry.id)}
              title={str(entry.commissionType ?? entry.applicationNumber)}
              subtitle={`${formatCurrency(entry.amount as number)} · ${formatDate(entry.createdAt as string)}`}
              status={str(entry.status)}
              icon="hourglass"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
