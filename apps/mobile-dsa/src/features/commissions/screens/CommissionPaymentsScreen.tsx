import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';

export function CommissionPaymentsScreen() {
  const { partnerId } = useAuth();

  const payments = useQuery({
    queryKey: ['commission-payments', partnerId],
    queryFn: () => commissionsService.payments({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  return (
    <Screen scroll title="Commission Payments">
      <Card>
        {payments.isError ? (
          <EmptyState title="Failed to load payments" description={getApiErrorMessage(payments.error)} />
        ) : (payments.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No payments yet" description="Approved commissions will be paid to your bank account" />
        ) : (
          payments.data?.items.map((p) => (
            <ListRow
              key={String(p.id)}
              title={str(p.paymentReference ?? p.id)}
              subtitle={`${formatCurrency(p.amount as number)} · ${formatDate(p.paidAt as string ?? p.createdAt as string)}`}
              status={str(p.status)}
              icon="cash"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
