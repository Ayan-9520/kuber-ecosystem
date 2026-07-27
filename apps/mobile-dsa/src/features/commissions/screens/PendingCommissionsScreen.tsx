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

export function PendingCommissionsScreen() {
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();

  const pending = useQuery({
    queryKey: ['commission-pending-list', partnerId],
    queryFn: () => commissionsService.ledger({ partnerId, status: 'PENDING', limit: 50 }),
    enabled: !!partnerId,
  });

  return (
    <Screen
      scroll
      title="Pending commissions"
      refreshControl={
        <RefreshControl
          refreshing={pending.isRefetching}
          onRefresh={() => void pending.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      <Card subtitle={`${pending.data?.meta.total ?? 0} awaiting calculation`}>
        {pending.isError ? (
          <EmptyState title="Failed to load" description={getApiErrorMessage(pending.error)} />
        ) : (pending.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="Nothing pending" description="All commissions are calculated or paid." />
        ) : (
          pending.data?.items.map((entry) => (
            <ListRow
              key={String(entry.id)}
              title={str(entry.ledgerNumber ?? entry.commissionType ?? entry.applicationNumber)}
              subtitle={`${formatCurrency(amountOf(entry))} · ${formatDate(entry.createdAt as string)}`}
              status={str(entry.status)}
              icon="hourglass"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
