import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EarningsTimeline } from '@/features/earnings-finance/components/EarningsTimeline';
import type { TimelineEvent } from '@/features/earnings-finance/data/types';
import { Button, Card, EmptyState, ListRow, Screen, StatCard, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, str } from '@/lib/utils';
import type { CommissionsStackParamList } from '@/navigation/types';
import { commissionsService, referralsService } from '@/services';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

type Nav = NativeStackNavigationProp<CommissionsStackParamList>;
type Row = Record<string, unknown>;

const PAGE = { page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' } as const;

interface AnalyticsSummary {
  totals?: { totalCommission?: number; entryCount?: number };
  paidCommissions?: number;
  commissionOutstanding?: number;
  recoverySummary?: { totalRecovered?: number };
  commissionTypeBreakdown?: Array<{
    commissionType?: string;
    status?: string;
    _sum?: { commissionAmount?: unknown };
  }>;
}

function usePartnerAnalytics() {
  const { partnerId } = useAuth();
  return useQuery({
    queryKey: ['commission-analytics', partnerId],
    queryFn: () => commissionsService.analytics({ partnerId }) as Promise<AnalyticsSummary>,
    enabled: !!partnerId,
  });
}

function useLedger(params: Row = {}) {
  const { partnerId } = useAuth();
  return useQuery({
    queryKey: ['commission-ledger', partnerId, params],
    queryFn: () => commissionsService.ledger({ ...PAGE, partnerId, ...params }),
    enabled: !!partnerId,
  });
}

function amountOf(row: Row): number {
  return Number(row.commissionAmount ?? row.amount ?? 0);
}

function ledgerSubtitle(row: Row): string {
  const product = (row.product as Row | undefined)?.name;
  const lender = (row.lender as Row | undefined)?.name;
  const type = String(row.commissionType ?? '').replace(/_/g, ' ');
  return [product, lender, type].filter(Boolean).map(String).join(' · ');
}

function refreshProps(query: { isRefetching: boolean; refetch: () => unknown }, tint: string) {
  return {
    refreshControl: (
      <RefreshControl
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        tintColor={tint}
      />
    ),
  };
}

/** Maps a commission approval record to the shared timeline component's shape. */
function approvalTimeline(approval: Row): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `${String(approval.id)}-requested`,
      status: 'PENDING',
      label: 'Submitted for approval',
      at: String(approval.createdAt ?? new Date().toISOString()),
      by: str((approval.requestedBy as Row | undefined)?.email ?? 'You'),
      comment: approval.notes ? str(approval.notes) : undefined,
    },
  ];

  if (approval.approvedAt) {
    events.push({
      id: `${String(approval.id)}-decided`,
      status: String(approval.status ?? 'APPROVED'),
      label: approval.status === 'REJECTED' ? 'Rejected by finance' : 'Approved by finance',
      at: String(approval.approvedAt),
      by: str((approval.approvedBy as Row | undefined)?.email ?? 'Finance desk'),
      comment: approval.rejectionReason ? str(approval.rejectionReason) : undefined,
    });
  }

  return events;
}

export function EarningsDashboardScreen() {
  const { colors } = useAppTheme();
  const analytics = usePartnerAnalytics();
  const data = analytics.data;
  const failed = analytics.isError;
  const money = (value: number) => (failed ? '—' : formatCurrency(value));

  return (
    <Screen scroll loading={analytics.isLoading} {...refreshProps(analytics, colors.primary)}>
      {failed ? (
        <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.sm }]}>
          Could not load your earnings summary. Pull down to retry.
        </Text>
      ) : null}

      <View style={styles.stats}>
        <StatCard label="Total earned" value={money(Number(data?.totals?.totalCommission ?? 0))} icon="wallet" />
        <StatCard
          label="Awaiting payout"
          value={money(Number(data?.commissionOutstanding ?? 0))}
          icon="lock-closed"
        />
      </View>
      <View style={styles.stats}>
        <StatCard label="Paid out" value={money(Number(data?.paidCommissions ?? 0))} icon="cash" />
        <StatCard
          label="Recovered"
          value={money(Number(data?.recoverySummary?.totalRecovered ?? 0))}
          icon="sync"
        />
      </View>

      <Card title="How payouts work">
        <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
          You can view earnings, submit approved commissions for payout, track status and download
          reports. The finance desk verifies, approves and releases every payment.
        </Text>
      </Card>
    </Screen>
  );
}

export function CommissionTrackerScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const ledger = useLedger();
  const rows = ledger.data?.items ?? [];

  return (
    <Screen scroll loading={ledger.isLoading} {...refreshProps(ledger, colors.primary)}>
      <Card title="All commissions" subtitle={`${ledger.data?.meta.total ?? 0} entries`}>
        {ledger.isError ? (
          <EmptyState
            title="Couldn’t load commissions"
            description="Check your connection and pull down to retry."
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No commissions yet"
            description="Commissions appear here once your cases are sanctioned and disbursed."
          />
        ) : (
          rows.map((c) => (
            <ListRow
              key={String(c.id)}
              title={str(c.ledgerNumber)}
              subtitle={ledgerSubtitle(c)}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[typography.label, { color: colors.text }]}>{formatCurrency(amountOf(c))}</Text>
                  <StatusBadge status={str(c.status)} />
                </View>
              }
              onPress={() => navigation.navigate('CommissionTimeline', { commissionId: String(c.id) })}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

export function RaiseInvoiceScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const submittable = useLedger({ status: 'CALCULATED' });
  const rows = submittable.data?.items ?? [];
  const [selected, setSelected] = useState<string[]>([]);

  const total = useMemo(
    () => rows.filter((c) => selected.includes(String(c.id))).reduce((s, c) => s + amountOf(c), 0),
    [rows, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        selected.map((id) => commissionsService.requestApproval(id, 'Submitted from partner app')),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { submitted: results.length - failed, failed };
    },
    onSuccess: ({ submitted, failed }) => {
      setSelected([]);
      void queryClient.invalidateQueries({ queryKey: ['commission-ledger'] });
      void queryClient.invalidateQueries({ queryKey: ['commission-approvals'] });
      Alert.alert(
        failed ? 'Partly submitted' : 'Submitted for payout',
        failed
          ? `${submitted} sent, ${failed} could not be submitted. Try the remaining items again.`
          : 'Finance will verify and schedule your payment. Track it under Invoices.',
      );
    },
    onError: () => {
      Alert.alert('Submission failed', 'Could not reach the finance service. Please try again.');
    },
  });

  return (
    <Screen scroll loading={submittable.isLoading} {...refreshProps(submittable, colors.primary)}>
      <Text style={[typography.bodySm, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        Select calculated commissions and submit them for payout. Finance will verify and schedule the
        payment.
      </Text>

      <Card title="Ready to submit">
        {rows.length === 0 ? (
          <EmptyState
            title="Nothing to submit"
            description="Commissions show up here once they are calculated on a disbursed case."
          />
        ) : (
          rows.map((c) => {
            const id = String(c.id);
            const isSelected = selected.includes(id);
            return (
              <Pressable key={id} onPress={() => toggle(id)}>
                <ListRow
                  title={str(c.ledgerNumber)}
                  subtitle={`${ledgerSubtitle(c)} · ${formatCurrency(amountOf(c))}`}
                  right={
                    <Text
                      style={[
                        typography.label,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {isSelected ? 'Selected' : 'Tap'}
                    </Text>
                  }
                />
              </Pressable>
            );
          })
        )}
      </Card>

      <Card title="Summary">
        <Text style={[typography.h3, { color: colors.text }]}>{formatCurrency(total)}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {selected.length} of {rows.length} selected
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <Button
            title={submit.isPending ? 'Submitting…' : 'Submit for payout'}
            onPress={() => submit.mutate()}
            disabled={selected.length === 0 || submit.isPending}
          />
        </View>
      </Card>
    </Screen>
  );
}

export function InvoiceTrackerScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const approvals = useQuery({
    queryKey: ['commission-approvals', 'mine'],
    queryFn: () => commissionsService.approvals(PAGE),
  });
  const rows = approvals.data?.items ?? [];

  return (
    <Screen scroll loading={approvals.isLoading} {...refreshProps(approvals, colors.primary)}>
      <Card title="Payout requests" subtitle={`${approvals.data?.meta.total ?? 0} submitted`}>
        {approvals.isError ? (
          <EmptyState title="Couldn’t load payout requests" description="Pull down to retry." />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No payout requests yet"
            description="Submit calculated commissions from Raise Invoice to see them here."
          />
        ) : (
          rows.map((inv) => (
            <ListRow
              key={String(inv.id)}
              title={str(inv.approvalNumber)}
              subtitle={`Requested ${formatCurrency(Number(inv.requestedAmount ?? 0))}`}
              right={<StatusBadge status={str(inv.status)} />}
              onPress={() => navigation.navigate('InvoiceTimeline', { invoiceId: String(inv.id) })}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

export function InvoiceTimelineScreen() {
  const route = useRoute<RouteProp<CommissionsStackParamList, 'InvoiceTimeline'>>();
  const { colors } = useAppTheme();
  const approval = useQuery({
    queryKey: ['commission-approvals', route.params.invoiceId],
    queryFn: () => commissionsService.approvalById(route.params.invoiceId),
  });
  const inv = approval.data;

  if (approval.isLoading) {
    return (
      <Screen loading scroll={false}>
        <View />
      </Screen>
    );
  }

  if (!inv) {
    return (
      <Screen>
        <EmptyState
          title="Payout request not found"
          description="It may have been withdrawn or you no longer have access."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll {...refreshProps(approval, colors.primary)}>
      <Card title={str(inv.approvalNumber)}>
        <StatusBadge status={str(inv.status)} />
        <Text style={{ marginTop: spacing.sm, color: colors.text }}>
          Requested {formatCurrency(Number(inv.requestedAmount ?? 0))}
          {inv.approvedAmount ? ` · Approved ${formatCurrency(Number(inv.approvedAmount))}` : ''}
        </Text>
      </Card>
      <Card>
        <EarningsTimeline events={approvalTimeline(inv)} title="Payout timeline" />
      </Card>
    </Screen>
  );
}

export function CommissionTimelineScreen() {
  const route = useRoute<RouteProp<CommissionsStackParamList, 'CommissionTimeline'>>();
  const { colors } = useAppTheme();
  const ledger = useQuery({
    queryKey: ['commission-ledger', route.params.commissionId],
    queryFn: () => commissionsService.ledgerById(route.params.commissionId),
  });
  const approvals = useQuery({
    queryKey: ['commission-approvals', 'ledger', route.params.commissionId],
    queryFn: () => commissionsService.approvals({ ...PAGE, ledgerId: route.params.commissionId }),
  });

  const item = ledger.data;

  if (ledger.isLoading) {
    return (
      <Screen loading scroll={false}>
        <View />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <EmptyState title="Commission not found" description="You may no longer have access to it." />
      </Screen>
    );
  }

  const events = (approvals.data?.items ?? []).flatMap((a) => approvalTimeline(a));

  return (
    <Screen scroll {...refreshProps(ledger, colors.primary)}>
      <Card title={str(item.ledgerNumber)}>
        <Text style={{ color: colors.text }}>{ledgerSubtitle(item)}</Text>
        <View style={{ marginTop: spacing.sm }}>
          <StatusBadge status={str(item.status)} />
        </View>
        <Text style={{ marginTop: spacing.sm, color: colors.text }}>
          Base {formatCurrency(Number(item.baseAmount ?? 0))} · Commission{' '}
          {formatCurrency(amountOf(item))}
        </Text>
        {item.notes ? (
          <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {str(item.notes)}
          </Text>
        ) : null}
      </Card>
      <Card>
        {events.length === 0 ? (
          <EmptyState
            title="No approval activity yet"
            description="Submit this commission for payout to start its approval trail."
          />
        ) : (
          <EarningsTimeline events={events} />
        )}
      </Card>
    </Screen>
  );
}

export function PartnerWalletScreen() {
  const { colors } = useAppTheme();
  const analytics = usePartnerAnalytics();
  const data = analytics.data;
  const money = (value: number) => (analytics.isError ? '—' : formatCurrency(value));

  return (
    <Screen scroll loading={analytics.isLoading} {...refreshProps(analytics, colors.primary)}>
      <View style={styles.stats}>
        <StatCard label="Total earned" value={money(Number(data?.totals?.totalCommission ?? 0))} icon="wallet" />
        <StatCard
          label="Awaiting payout"
          value={money(Number(data?.commissionOutstanding ?? 0))}
          icon="lock-closed"
        />
      </View>
      <View style={styles.stats}>
        <StatCard label="Recovered" value={money(Number(data?.recoverySummary?.totalRecovered ?? 0))} icon="sync" />
        <StatCard label="Lifetime paid" value={money(Number(data?.paidCommissions ?? 0))} icon="cash" />
      </View>
    </Screen>
  );
}

export function CommissionByStatusScreen() {
  const route = useRoute<RouteProp<CommissionsStackParamList, 'CommissionByStatus'>>();
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const status = route.params.status;
  const ledger = useLedger({ status });
  const rows = ledger.data?.items ?? [];

  return (
    <Screen scroll loading={ledger.isLoading} {...refreshProps(ledger, colors.primary)}>
      <Card title={`${status.replace(/_/g, ' ')} commissions`} subtitle={`${ledger.data?.meta.total ?? 0} entries`}>
        {rows.length === 0 ? (
          <EmptyState title="Nothing here yet" description="No commissions in this status." />
        ) : (
          rows.map((c) => (
            <ListRow
              key={String(c.id)}
              title={str(c.ledgerNumber)}
              subtitle={ledgerSubtitle(c)}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[typography.label, { color: colors.text }]}>{formatCurrency(amountOf(c))}</Text>
                  <StatusBadge status={str(c.status)} />
                </View>
              }
              onPress={() => navigation.navigate('CommissionTimeline', { commissionId: String(c.id) })}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

export function PayoutHistoryScreen() {
  const { colors } = useAppTheme();
  const { partnerId } = useAuth();
  const payments = useQuery({
    queryKey: ['commission-payments', partnerId],
    queryFn: () => commissionsService.payments({ ...PAGE, partnerId }),
    enabled: !!partnerId,
  });
  const rows = payments.data?.items ?? [];

  return (
    <Screen scroll loading={payments.isLoading} {...refreshProps(payments, colors.primary)}>
      <Card title="Payout history" subtitle={`${payments.data?.meta.total ?? 0} payments`}>
        {rows.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="Released payments with their UTR reference will appear here."
          />
        ) : (
          rows.map((p) => (
            <ListRow
              key={String(p.id)}
              title={str(p.paymentNumber)}
              subtitle={
                p.paymentReference
                  ? `Ref ${str(p.paymentReference)}`
                  : `Status ${str(p.status).replace(/_/g, ' ')}`
              }
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[typography.label, { color: colors.text }]}>{formatCurrency(Number(p.totalAmount ?? 0))}</Text>
                  <StatusBadge status={str(p.status)} />
                </View>
              }
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

export function TdsCentreScreen() {
  const { colors } = useAppTheme();
  const analytics = usePartnerAnalytics();

  return (
    <Screen scroll loading={analytics.isLoading} {...refreshProps(analytics, colors.primary)}>
      <StatCard
        label="Gross commission booked"
        value={
          analytics.isError ? '—' : formatCurrency(Number(analytics.data?.totals?.totalCommission ?? 0))
        }
        icon="calculator"
      />
      <Card title="TDS on your payouts">
        <EmptyState
          title="TDS certificates coming soon"
          description="TDS is deducted when finance releases payout. Certificates will appear here after year-end reconciliation — same numbers Admin finance uses."
        />
      </Card>
    </Screen>
  );
}

export function GstReportsScreen() {
  return (
    <Screen scroll>
      <Card title="GST on partner payouts">
        <EmptyState
          title="GST summary coming soon"
          description="Add GSTIN on your profile. Once finance enables GST on payouts, a cycle-wise summary will show here."
        />
      </Card>
    </Screen>
  );
}

export function DownloadStatementsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen scroll>
      <Card title="Statements">
        <EmptyState
          title="Export coming soon"
          description="Use Ledger and Payout history for now. PDF/CSV email export will use the same commission ledger Admin exports."
          action={
            <Button title="Open ledger" onPress={() => navigation.navigate('CommissionLedger')} />
          }
        />
      </Card>
    </Screen>
  );
}

export function IncentiveTrackerScreen() {
  const { colors } = useAppTheme();
  const analytics = usePartnerAnalytics();
  const breakdown = analytics.data?.commissionTypeBreakdown ?? [];

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of breakdown) {
      const key = String(row.commissionType ?? 'OTHER');
      map.set(key, (map.get(key) ?? 0) + Number(row._sum?.commissionAmount ?? 0));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [breakdown]);

  return (
    <Screen scroll loading={analytics.isLoading} {...refreshProps(analytics, colors.primary)}>
      <Card title="Earnings by type" subtitle="Where your income comes from">
        {byType.length === 0 ? (
          <EmptyState
            title="No earnings breakdown yet"
            description="Your income mix appears once commissions are booked."
          />
        ) : (
          byType.map(([type, amount]) => (
            <ListRow
              key={type}
              title={type.replace(/_/g, ' ')}
              right={<Text style={[typography.label, { color: colors.text }]}>{formatCurrency(amount)}</Text>}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

export function BonusTrackerScreen() {
  const { colors } = useAppTheme();
  const bonuses = useLedger({ commissionType: 'CAMPAIGN_BONUS' });
  const rows = bonuses.data?.items ?? [];

  return (
    <Screen scroll loading={bonuses.isLoading} {...refreshProps(bonuses, colors.primary)}>
      <Card title="Campaign bonuses" subtitle={`${bonuses.data?.meta.total ?? 0} entries`}>
        {rows.length === 0 ? (
          <EmptyState
            title="No bonuses yet"
            description="Campaign and milestone bonuses will show up here when earned."
          />
        ) : (
          rows.map((row) => (
            <ListRow
              key={String(row.id)}
              title={str(row.ledgerNumber)}
              subtitle={ledgerSubtitle(row)}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[typography.label, { color: colors.text }]}>{formatCurrency(amountOf(row))}</Text>
                  <StatusBadge status={str(row.status)} />
                </View>
              }
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

export function ReferralIncomeScreen() {
  const { colors } = useAppTheme();
  const { partnerId } = useAuth();
  const referrals = useQuery({
    queryKey: ['referrals', partnerId],
    queryFn: () => referralsService.list({ ...PAGE, referrerPartnerId: partnerId }),
    enabled: !!partnerId,
  });
  const rows = referrals.data?.items ?? [];

  return (
    <Screen scroll loading={referrals.isLoading} {...refreshProps(referrals, colors.primary)}>
      <Card title="Referral income" subtitle={`${referrals.data?.meta.total ?? 0} referrals`}>
        {rows.length === 0 ? (
          <EmptyState
            title="No referrals yet"
            description="Invite other professionals and earn from their business."
          />
        ) : (
          rows.map((row) => (
            <ListRow
              key={String(row.id)}
              title={str(row.refereeName ?? row.referralCode ?? row.id)}
              subtitle={str(row.refereeMobile ?? '')}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[typography.label, { color: colors.text }]}>{formatCurrency(Number(row.rewardAmount ?? 0))}</Text>
                  <StatusBadge status={str(row.status)} />
                </View>
              }
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
});
