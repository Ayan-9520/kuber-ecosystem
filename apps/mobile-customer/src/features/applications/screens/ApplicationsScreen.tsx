import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService } from '@/services';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function ApplicationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ApplicationsStackParamList>>();
  const { customerId } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const applications = useQuery({
    queryKey: ['applications', customerId],
    queryFn: () =>
      applicationsService.list({
        customerId,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!customerId,
  });

  if (!customerId) {
    return (
      <Screen>
        <EmptyState
          title="Sign in required"
          description="Complete your profile to view loan applications"
        />
      </Screen>
    );
  }

  if (applications.isLoading) {
    return (
      <Screen loading>
        <></>
      </Screen>
    );
  }

  if (applications.isError) {
    return (
      <Screen>
        <EmptyState
          title="Could not load applications"
          description={getApiErrorMessage(applications.error)}
          action={
            <Button title="Retry" variant="secondary" onPress={() => applications.refetch()} />
          }
        />
      </Screen>
    );
  }

  const items = applications.data?.items ?? [];

  return (
    <Screen title="My Applications" subtitle={`${applications.data?.meta.total ?? 0} total applications`}>
      {items.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse loan products and start your first application"
          action={
            <Button
              title="Browse Products"
              onPress={() => navigation.getParent()?.navigate('Products')}
            />
          }
        />
      ) : (
        items.map((app) => (
          <Card
            key={String(app.id)}
            onPress={() => navigation.navigate('ApplicationDetail', { id: String(app.id) })}
          >
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.appNumber}>{str(app.applicationNumber ?? app.id)}</Text>
                <Text style={styles.product}>{str(app.productName)}</Text>
                <Text style={styles.amount}>{formatCurrency((app.loanAmount ?? app.requestedAmount) as number)}</Text>
                <Text style={styles.date}>{formatDateTime(app.createdAt as string)}</Text>
              </View>
              <View style={styles.trailing}>
                <StatusBadge status={str(app.status)} />
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    info: { flex: 1 },
    appNumber: { ...typography.label, color: colors.text },
    product: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
    amount: { ...typography.h3, color: colors.primary, marginTop: spacing.sm, fontSize: 16 },
    date: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, fontSize: 11 },
    trailing: { alignItems: 'flex-end', gap: spacing.sm },
    chevron: { marginTop: spacing.xs },
  });
}
