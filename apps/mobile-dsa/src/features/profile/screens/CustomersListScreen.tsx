import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { customersService } from '@/services';

export function CustomersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId } = useAuth();

  const customers = useQuery({
    queryKey: ['partner-customers', partnerId],
    queryFn: () => customersService.list({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  return (
    <Screen scroll title="Customers">
      <Card subtitle={`${customers.data?.meta.total ?? 0} customers in your scope`}>
        {customers.isError ? (
          <EmptyState title="Failed to load customers" description={getApiErrorMessage(customers.error)} />
        ) : (customers.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No customers yet" description="Customers appear when leads convert" />
        ) : (
          customers.data?.items.map((c) => (
            <ListRow
              key={String(c.id)}
              title={str(c.fullName ?? c.name)}
              subtitle={str(c.phone ?? c.email)}
              status={str(c.status)}
              icon="person"
              onPress={() => navigation.navigate('CustomerDetail', { id: String(c.id) })}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
