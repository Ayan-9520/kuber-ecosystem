import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import { leadsService } from '@/services';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    big: { ...typography.h2, color: colors.primary },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
    label: { ...typography.bodySm, color: colors.textSecondary },
    value: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
    muted: { color: colors.textMuted },
  });
}

export function LeadAnalyticsScreen() {
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const analytics = useQuery({
    queryKey: ['lead-analytics', partnerId],
    queryFn: () => leadsService.analytics(),
    enabled: !!partnerId,
  });

  const data = analytics.data ?? {};

  return (
    <Screen scroll title="Lead Analytics" subtitle="Your partner pipeline performance">
      {analytics.isError ? (
        <EmptyState title="Analytics unavailable" description={getApiErrorMessage(analytics.error)} />
      ) : analytics.isLoading ? (
        <Text style={styles.muted}>Loading analytics...</Text>
      ) : (
        <>
          <View style={styles.row}>
            <StatCard label="Total Leads" value={Number(data.totalLeads ?? 0)} icon="people" />
            <StatCard label="Converted" value={Number(data.convertedLeads ?? data.converted ?? 0)} icon="checkmark-circle" />
          </View>
          <View style={styles.row}>
            <StatCard label="In Process" value={Number(data.inProcess ?? 0)} icon="hourglass" />
            <StatCard label="Hot (A/A+)" value={Number(data.hotLeads ?? 0)} icon="flame" />
          </View>
          <View style={styles.row}>
            <StatCard label="Today" value={Number(data.todayLeads ?? 0)} icon="today" />
            <StatCard label="Lost" value={Number(data.lostLeads ?? data.rejected ?? 0)} icon="close-circle" />
          </View>

          <Card title="Conversion Rate" elevated>
            <Text style={styles.big}>{str(data.conversionRate ?? '0%')}</Text>
          </Card>

          <Card title="Pipeline Value" elevated>
            <Text style={styles.big}>{formatCurrency(Number(data.pipelineValue ?? 0))}</Text>
          </Card>

          {Array.isArray(data.byStatusList) && data.byStatusList.length > 0 && (
            <Card title="By Status" elevated>
              {(data.byStatusList as Array<{ status: string; count: number }>).map((row) => (
                <View key={row.status} style={styles.statusRow}>
                  <Text style={styles.label}>{row.status.replace(/_/g, ' ')}</Text>
                  <Text style={styles.value}>{row.count}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}
