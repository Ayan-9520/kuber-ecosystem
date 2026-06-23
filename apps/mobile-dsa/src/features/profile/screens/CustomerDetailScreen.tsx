import { type RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { customersService } from '@/services';

type Route = RouteProp<ProfileStackParamList, 'CustomerDetail'>;

export function CustomerDetailScreen() {
  const { params } = useRoute<Route>();

  const customer = useQuery({
    queryKey: ['customer', params.id],
    queryFn: () => customersService.getById(params.id),
  });

  const applications = useQuery({
    queryKey: ['customer-apps', params.id],
    queryFn: () => customersService.applications(params.id),
  });

  if (customer.isLoading) return <Screen loading><></></Screen>;

  if (customer.isError) {
    return (
      <Screen>
        <EmptyState title="Customer not found" description={getApiErrorMessage(customer.error)} />
      </Screen>
    );
  }

  const c = customer.data!;

  return (
    <Screen scroll>
      <Card title={str(c.fullName ?? c.name)}>
        <ListRow title="Phone" subtitle={str(c.phone)} icon="call" />
        <ListRow title="Email" subtitle={str(c.email)} icon="mail" />
        <ListRow title="Status" subtitle={str(c.status)} icon="information-circle" />
      </Card>

      <Card title="Application History">
        {(applications.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No applications" description="This customer has no loan applications yet" />
        ) : (
          applications.data?.items.map((app) => (
            <ListRow
              key={String(app.id)}
              title={str(app.applicationNumber)}
              subtitle={`${str(app.productName)} · ${formatCurrency((app.loanAmount ?? app.requestedAmount) as number)} · ${formatDate(app.createdAt as string)} · ${str(app.status)}`}
              status={str(app.status)}
              icon="document-text"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
