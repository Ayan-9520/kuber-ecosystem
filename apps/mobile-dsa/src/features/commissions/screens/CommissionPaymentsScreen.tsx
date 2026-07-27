import { useQuery } from '@tanstack/react-query';
import { RefreshControl } from 'react-native';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';
import { useAppTheme } from '@/theme/ThemeProvider';

function amountOf(p: Record<string, unknown>): number {
  return Number(p.totalAmount ?? p.amount ?? p.netAmount ?? 0);
}

export function CommissionPaymentsScreen() {
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();

  const payments = useQuery({
    queryKey: ['commission-payments', partnerId],
    queryFn: () =>
      commissionsService.payments({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  return (
    <Screen
      scroll
      title="Payout history"
      refreshControl={
        <RefreshControl
          refreshing={payments.isRefetching}
          onRefresh={() => void payments.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      <Card>
        {payments.isError ? (
          <EmptyState title="Failed to load payments" description={getApiErrorMessage(payments.error)} />
        ) : (payments.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="Approved commissions are credited to your registered bank account."
          />
        ) : (
          payments.data?.items.map((p) => (
            <ListRow
              key={String(p.id)}
              title={str(p.paymentReference ?? p.transactionRef ?? p.id)}
              subtitle={`${formatCurrency(amountOf(p))} · ${formatDate(
                (p.paidAt as string) ?? (p.createdAt as string),
              )}`}
              status={str(p.status)}
              icon="cash"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
