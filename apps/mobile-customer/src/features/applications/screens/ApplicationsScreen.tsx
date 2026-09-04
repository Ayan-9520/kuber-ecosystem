import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function ApplicationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ApplicationsStackParamList>>();
  const { customerId } = useAuth();
  const { colors } = useAppTheme();
  const { pagePad, listColumns } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, pagePad, listColumns), [colors, pagePad, listColumns]);

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
      <Screen scroll padded={false}>
        <PageHero title="Applications" subtitle="Track your loan pipeline" icon="document-text" />
        <View style={styles.body}>
          <EmptyState
            title="Sign in required"
            description="Complete your profile to view loan applications"
          />
        </View>
      </Screen>
    );
  }

  if (applications.isLoading) {
    return (
      <Screen loading scroll padded={false}>
        <PageHero title="Applications" subtitle="Loading your pipeline…" icon="document-text" />
      </Screen>
    );
  }

  if (applications.isError) {
    return (
      <Screen scroll padded={false}>
        <PageHero title="Applications" subtitle="Could not load pipeline" icon="document-text" />
        <View style={styles.body}>
          <EmptyState
            title="Could not load applications"
            description={getApiErrorMessage(applications.error)}
            action={
              <Button title="Retry" variant="secondary" onPress={() => applications.refetch()} />
            }
          />
        </View>
      </Screen>
    );
  }

  const items = applications.data?.items ?? [];
  const total = applications.data?.meta.total ?? 0;

  return (
    <Screen scroll padded={false}>
      <PageHero
        eyebrow="Pipeline"
        title="My Applications"
        subtitle={`${total} total application${total === 1 ? '' : 's'}`}
        icon="document-text"
        actions={
          <Button
            title="Browse products"
            variant="secondary"
            onPress={() => navigation.getParent()?.navigate('Products')}
          />
        }
      />

      <View style={styles.body}>
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
          <View style={styles.grid}>
            {items.map((app) => (
              <View key={String(app.id)} style={styles.cell}>
                <Card
                  elevated
                  onPress={() => navigation.navigate('ApplicationDetail', { id: String(app.id) })}
                >
                  <View style={styles.row}>
                    <View style={styles.iconPlate}>
                      <Text style={styles.iconText}>₹</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.appNumber}>{str(app.applicationNumber ?? app.id)}</Text>
                      <Text style={styles.product}>{str(app.productName)}</Text>
                      <Text style={styles.amount}>
                        {formatCurrency((app.loanAmount ?? app.requestedAmount) as number)}
                      </Text>
                      <Text style={styles.date}>{formatDateTime(app.createdAt as string)}</Text>
                    </View>
                    <View style={styles.trailing}>
                      <StatusBadge status={str(app.status)} />
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </View>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  pagePad: number,
  listColumns: number,
) {
  return StyleSheet.create({
    body: { paddingHorizontal: pagePad, paddingBottom: spacing.xl, gap: spacing.md },
    grid: {
      flexDirection: listColumns > 1 ? 'row' : 'column',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    cell: {
      flexBasis: listColumns > 1 ? '48%' : '100%',
      flexGrow: 1,
      minWidth: listColumns > 1 ? 320 : undefined,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconPlate: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}16`,
      borderWidth: 1,
      borderColor: `${colors.primary}28`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
    info: { flex: 1, minWidth: 0 },
    appNumber: { ...typography.label, color: colors.text, fontSize: 14 },
    product: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
    amount: { ...typography.h3, color: colors.primary, marginTop: spacing.sm, fontSize: 16, fontWeight: '700' },
    date: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, fontSize: 11 },
    trailing: { alignItems: 'flex-end', gap: spacing.sm },
  });
}
