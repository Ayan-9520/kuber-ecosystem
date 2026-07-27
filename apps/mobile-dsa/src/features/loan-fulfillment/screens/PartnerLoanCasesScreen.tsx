import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card, ListRow, Screen, StatCard, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { apiGet, apiGetPaginated } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

type PartnerLoanCase = {
  id: string;
  caseNumber: string;
  stage: string;
  product: string;
  lenderName: string;
  customerName: string;
  loanAmount: number;
  sanctionAmount?: number | null;
  disbursementAmount?: number | null;
  expectedCommission?: number | null;
  paidCommission?: number | null;
  pendingCommission?: number | null;
  myCommission?: {
    expected: number;
    pending: number;
    paid: number;
  };
  updatedAt?: string;
};

type PartnerCaseDetail = PartnerLoanCase & {
  timeline?: { stage: string; title: string; createdAt: string }[];
  documents?: { documentType: string; fileName: string; createdAt: string }[];
};

/**
 * Partner-safe Loan Fulfillment view.
 * Never shows company margin, employee incentives, internal notes, or other partners.
 */
export function PartnerLoanCasesScreen() {
  const { colors } = useAppTheme();
  const { partnerId } = useAuth();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const list = useQuery({
    queryKey: ['partner-loan-cases', partnerId],
    queryFn: () =>
      apiGetPaginated<PartnerLoanCase>('/loan-fulfillment/cases', {
        page: 1,
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
    enabled: Boolean(partnerId),
  });

  const detail = useQuery({
    queryKey: ['partner-loan-case', selectedId],
    queryFn: () => apiGet<PartnerCaseDetail>(`/loan-fulfillment/cases/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const cases = list.data?.items ?? [];
  const selected = detail.data ?? cases.find((c) => c.id === selectedId);
  const expected = cases.reduce(
    (sum, c) => sum + Number(c.myCommission?.expected ?? c.expectedCommission ?? 0),
    0,
  );
  const pendingAmount = cases.reduce(
    (sum, c) =>
      sum +
      Number(
        c.myCommission?.pending ??
          c.pendingCommission ??
          Math.max(0, Number(c.expectedCommission ?? 0) - Number(c.paidCommission ?? 0)),
      ),
    0,
  );
  const paidAmount = cases.reduce(
    (sum, c) => sum + Number(c.myCommission?.paid ?? c.paidCommission ?? 0),
    0,
  );

  const refreshing = list.isFetching || detail.isFetching;
  const onRefresh = () => {
    void list.refetch();
    if (selectedId) void detail.refetch();
  };

  return (
    <Screen
      scroll
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[typography.h3, { color: colors.text }]}>My Loan Cases</Text>
      <Text style={[typography.bodySm, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        Track your cases, journey stage, expected commission, and payment history. Internal company
        margins are never shown.
      </Text>

      <View style={styles.stats}>
        <StatCard label="My cases" value={String(cases.length)} icon="briefcase" />
        <StatCard label="Expected commission" value={formatCurrency(expected)} icon="wallet" />
        <StatCard label="Pending payout" value={formatCurrency(pendingAmount)} icon="time" />
        <StatCard label="Paid to me" value={formatCurrency(paidAmount)} icon="checkmark-circle" />
      </View>

      <Card title="Cases">
        {list.isLoading ? (
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Loading your cases…</Text>
        ) : null}
        {list.isError ? (
          <Text style={[typography.bodySm, { color: colors.danger }]}>
            Unable to load loan cases. Pull again or contact support.
          </Text>
        ) : null}
        {!list.isLoading && !list.isError && cases.length === 0 ? (
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            No loan cases assigned yet. New cases appear after login and bank processing.
          </Text>
        ) : null}
        {cases.map((item) => (
          <Pressable key={item.id} onPress={() => setSelectedId(item.id)}>
            <ListRow
              title={item.caseNumber}
              subtitle={`${item.customerName} · ${item.lenderName} · ${item.product.replace(/_/g, ' ')}`}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[typography.label, { color: colors.text }]}>
                    {formatCurrency(Number(item.loanAmount ?? 0))}
                  </Text>
                  <StatusBadge status={item.stage} />
                </View>
              }
            />
          </Pressable>
        ))}
      </Card>

      {selected ? (
        <Card title={`${selected.caseNumber} · Journey`}>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            Current stage: {selected.stage.replace(/_/g, ' ')}
          </Text>
          <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm }]}>
            {formatCurrency(Number(selected.myCommission?.expected ?? selected.expectedCommission ?? 0))}
          </Text>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Expected commission</Text>

          <View style={styles.commissionRow}>
            <Text style={[typography.bodySm, { color: colors.text }]}>
              Pending{' '}
              {formatCurrency(
                selected.myCommission?.pending ??
                  selected.pendingCommission ??
                  Math.max(
                    0,
                    Number(selected.expectedCommission ?? 0) - Number(selected.paidCommission ?? 0),
                  ),
              )}
            </Text>
            <Text style={[typography.bodySm, { color: colors.text }]}>
              Paid{' '}
              {formatCurrency(selected.myCommission?.paid ?? Number(selected.paidCommission ?? 0))}
            </Text>
          </View>

          <Text style={[typography.label, { color: colors.text, marginTop: spacing.md }]}>Timeline</Text>
          {(detail.data?.timeline ?? []).slice(-6).map((event) => (
            <Text key={`${event.stage}-${event.createdAt}`} style={[typography.bodySm, { color: colors.textSecondary }]}>
              · {event.title} · {new Date(event.createdAt).toLocaleDateString('en-IN')}
            </Text>
          ))}

          <Text style={[typography.label, { color: colors.text, marginTop: spacing.md }]}>Documents shared</Text>
          {(detail.data?.documents ?? []).length === 0 ? (
            <Text style={[typography.bodySm, { color: colors.textSecondary }]}>No documents shared yet.</Text>
          ) : (
            (detail.data?.documents ?? []).map((doc) => (
              <Text key={`${doc.fileName}-${doc.createdAt}`} style={[typography.bodySm, { color: colors.textSecondary }]}>
                · {doc.documentType} · {doc.fileName}
              </Text>
            ))
          )}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  commissionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
});
