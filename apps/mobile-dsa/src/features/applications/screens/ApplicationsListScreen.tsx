import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, ListRow, PageHero, Screen } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService } from '@/services';
import { useAppTheme } from '@/theme/ThemeProvider';

export function ApplicationsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ApplicationsStackParamList>>();
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(() => StyleSheet.create({ body: { paddingHorizontal: isDesktop ? pagePad : 16 } }), [isDesktop, pagePad]);
  const [refreshing, setRefreshing] = useState(false);

  const applications = useQuery({
    queryKey: ['applications', partnerId],
    queryFn: () => applicationsService.list({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await applications.refetch();
    setRefreshing(false);
  }, [applications]);

  return (
    <Screen
      scroll
      padded={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <PageHero
        eyebrow="Portfolio"
        title="Applications"
        subtitle="Loan applications in your pipeline"
        icon="document-text"
      />
      <View style={styles.body}>
      <Card title="Your applications" subtitle={`${applications.data?.meta.total ?? 0} in portfolio`}>
        {!partnerId ? (
          <EmptyState title="Partner not linked" description="Contact support" />
        ) : applications.isLoading ? (
          <Text style={{ color: colors.textMuted }}>Loading...</Text>
        ) : applications.isError ? (
          <EmptyState title="Failed to load" description={getApiErrorMessage(applications.error)} />
        ) : (applications.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No applications" description="Convert qualified leads to applications" />
        ) : (
          applications.data?.items.map((app) => (
            <ListRow
              key={String(app.id)}
              title={str(app.applicationNumber ?? app.id)}
              subtitle={`${str(app.customerName ?? (app.customer as Record<string, unknown> | undefined)?.fullName)} · ${str(app.productName)} · ${formatCurrency((app.loanAmount ?? app.requestedAmount) as number)} · ${formatDateTime(app.updatedAt as string)}`}
              status={str(app.status)}
              icon="document-text"
              onPress={() => navigation.navigate('ApplicationDetail', { id: String(app.id) })}
            />
          ))
        )}
      </Card>
      </View>
    </Screen>
  );
}
