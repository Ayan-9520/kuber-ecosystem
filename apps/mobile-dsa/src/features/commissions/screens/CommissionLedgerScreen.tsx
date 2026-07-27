import { useQuery } from '@tanstack/react-query';
import { RefreshControl } from 'react-native';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';
import { useAppTheme } from '@/theme/ThemeProvider';

function amountOf(entry: Record<string, unknown>): number {
  return Number(entry.commissionAmount ?? entry.amount ?? 0);
}

export function CommissionLedgerScreen() {
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();

  const ledger = useQuery({
    queryKey: ['commission-ledger', partnerId],
    queryFn: () =>
      commissionsService.ledger({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  return (
    <Screen
      scroll
      title="Commission Ledger"
      refreshControl={
        <RefreshControl
          refreshing={ledger.isRefetching}
          onRefresh={() => void ledger.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      <Card>
        {ledger.isError ? (
          <EmptyState title="Failed to load ledger" description={getApiErrorMessage(ledger.error)} />
        ) : (ledger.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No ledger entries"
            description="Commissions appear here when your loan cases disburse."
          />
        ) : (
          ledger.data?.items.map((entry) => (
            <ListRow
              key={String(entry.id)}
              title={str(entry.ledgerNumber ?? entry.commissionType ?? entry.id)}
              subtitle={`${formatCurrency(amountOf(entry))} · ${formatDate(entry.createdAt as string)}`}
              status={str(entry.status)}
              icon="receipt"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
