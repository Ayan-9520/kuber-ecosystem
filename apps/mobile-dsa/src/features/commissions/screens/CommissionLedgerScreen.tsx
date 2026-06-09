import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';

export function CommissionLedgerScreen() {
  const { partnerId } = useAuth();

  const ledger = useQuery({
    queryKey: ['commission-ledger', partnerId],
    queryFn: () => commissionsService.ledger({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  return (
    <Screen scroll title="Commission Ledger">
      <Card>
        {ledger.isError ? (
          <EmptyState title="Failed to load ledger" description={getApiErrorMessage(ledger.error)} />
        ) : (ledger.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No ledger entries" description="Commissions appear when leads convert" />
        ) : (
          ledger.data?.items.map((entry) => (
            <ListRow
              key={String(entry.id)}
              title={str(entry.commissionType ?? entry.ruleName ?? entry.id)}
              subtitle={`${formatCurrency(entry.amount as number)} · ${formatDate(entry.createdAt as string)}`}
              status={str(entry.status)}
              icon="receipt"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
