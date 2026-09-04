import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { Card, PageHero, Screen } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { getApiErrorMessage, str } from '@/lib/utils';
import { notificationQueryKeys } from '@/lib/notification-queries';
import { notificationsService } from '@/services';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const CHANNEL_LABELS: Record<string, string> = {
  IN_APP: 'In-App',
  EMAIL: 'Email',
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp',
  PUSH: 'Push',
};

const EVENT_LABELS: Record<string, string> = {
  APPLICATION_CREATED: 'Application created',
  APPLICATION_SUBMITTED: 'Application submitted',
  DOCUMENT_REQUESTED: 'Document requested',
  DOCUMENT_VERIFIED: 'Document verified',
  DOCUMENT_REJECTED: 'Document rejected',
  SANCTION_ISSUED: 'Sanction issued',
  DISBURSEMENT_COMPLETED: 'Disbursement completed',
  REFERRAL_CONVERTED: 'Referral converted',
  REWARD_APPROVED: 'Reward approved',
  SUPPORT_TICKET_CREATED: 'Support ticket created',
  SUPPORT_TICKET_CLOSED: 'Support ticket closed',
};

function formatLabel(key: string, map: Record<string, string>): string {
  return map[key] ?? key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function SettingsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();
  const { pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, pagePad), [colors, pagePad]);

  const preferences = useQuery({
    queryKey: notificationQueryKeys.preferences(user?.id),
    queryFn: () => notificationsService.preferences(user!.id),
    enabled: !!user?.id,
    staleTime: 120_000,
  });

  const upsert = useMutation({
    mutationFn: (data: { eventType: string; channel: string; enabled: boolean }) =>
      notificationsService.upsertPreference({
        userId: user!.id,
        eventType: data.eventType,
        channel: data.channel,
        enabled: data.enabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.preferences(user?.id) });
    },
  });

  const grouped = useMemo(() => {
    const items = preferences.data?.items ?? [];
    const map = new Map<string, Record<string, unknown>[]>();
    for (const pref of items) {
      const channel = String(pref.channel ?? 'IN_APP');
      const list = map.get(channel) ?? [];
      list.push(pref);
      map.set(channel, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [preferences.data?.items]);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode ??
    '—';

  const togglePreference = (pref: Record<string, unknown>, enabled: boolean) => {
    upsert.mutate({
      eventType: String(pref.eventType),
      channel: String(pref.channel),
      enabled,
    });
  };

  return (
    <Screen scroll padded={false}>
      <PageHero
        eyebrow="Preferences"
        title="Settings"
        subtitle="Theme, notifications & app info"
        icon="settings"
      />

      <View style={styles.body}>
        <ThemeAppearanceCard />

        <Card title="Notification Preferences" subtitle="Choose how you receive updates" elevated>
          {!user?.id ? (
            <Text style={styles.muted}>Sign in to manage notification preferences</Text>
          ) : preferences.isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.muted}>Loading preferences...</Text>
            </View>
          ) : grouped.length === 0 ? (
            <Text style={styles.muted}>
              No preferences configured yet. Defaults from your account will apply.
            </Text>
          ) : (
            grouped.map(([channel, prefs]) => (
              <View key={channel} style={styles.channelGroup}>
                <View style={styles.channelHeader}>
                  <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                  <Text style={styles.channelTitle}>{formatLabel(channel, CHANNEL_LABELS)}</Text>
                </View>
                {prefs.map((pref) => {
                  const eventType = String(pref.eventType);
                  const key = `${eventType}-${channel}`;
                  const enabled = Boolean(pref.enabled);
                  const pending =
                    upsert.isPending &&
                    upsert.variables?.eventType === eventType &&
                    upsert.variables?.channel === channel;

                  return (
                    <View key={key} style={styles.prefRow}>
                      <View style={styles.prefText}>
                        <Text style={styles.prefLabel}>{formatLabel(eventType, EVENT_LABELS)}</Text>
                        <Text style={styles.prefMeta}>{str(pref.channel)}</Text>
                      </View>
                      <Switch
                        value={enabled}
                        onValueChange={(val) => togglePreference(pref, val)}
                        disabled={pending}
                        trackColor={{ false: colors.border, true: `${colors.primary}59` }}
                        thumbColor={enabled ? colors.primary : colors.textMuted}
                      />
                    </View>
                  );
                })}
              </View>
            ))
          )}
          {preferences.isError ? (
            <Text style={styles.error}>{getApiErrorMessage(preferences.error)}</Text>
          ) : null}
          {upsert.isError ? <Text style={styles.error}>{getApiErrorMessage(upsert.error)}</Text> : null}
        </Card>

        <Card title="App Information" elevated>
          <InfoRow styles={styles} icon="phone-portrait-outline" label="App" value="KuberOne Customer" colors={colors} />
          <InfoRow styles={styles} icon="git-branch-outline" label="Version" value={appVersion} colors={colors} />
          <InfoRow styles={styles} icon="build-outline" label="Build" value={String(buildNumber)} colors={colors} />
          <InfoRow
            styles={styles}
            icon="server-outline"
            label="API"
            value={
              (Constants.expoConfig?.extra?.apiBaseUrl as string) ??
              process.env.EXPO_PUBLIC_API_BASE_URL ??
              '—'
            }
            colors={colors}
            last
          />
          {user?.email ? (
            <InfoRow styles={styles} icon="mail-outline" label="Account" value={user.email} colors={colors} />
          ) : null}
          {user?.phone ? (
            <InfoRow styles={styles} icon="call-outline" label="Phone" value={user.phone} colors={colors} last />
          ) : null}
        </Card>

        <Card title="About" elevated>
          <Text style={styles.aboutText}>
            KuberOne is your premium fintech companion for home loans, business loans, auto loans,
            eligibility checks, document management, and AI-powered loan guidance.
          </Text>
          <Text style={styles.copyright}>© {new Date().getFullYear()} KuberFinServe</Text>
        </Card>
      </View>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  styles,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  styles: ReturnType<typeof createStyles>;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], pagePad: number) {
  return StyleSheet.create({
    body: { paddingHorizontal: pagePad, paddingBottom: spacing.xxl, gap: spacing.md },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    channelGroup: { marginBottom: spacing.lg },
    channelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    channelTitle: { ...typography.label, color: colors.text, fontSize: 15 },
    prefRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    prefText: { flex: 1, marginRight: spacing.md },
    prefLabel: { ...typography.body, color: colors.text },
    prefMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoRowLast: { borderBottomWidth: 0 },
    infoLabel: { ...typography.bodySm, color: colors.textMuted, width: 72 },
    infoValue: { ...typography.body, color: colors.text, flex: 1, textAlign: 'right' },
    aboutText: { ...typography.bodySm, color: colors.textMuted, lineHeight: 22 },
    copyright: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.lg },
    muted: { ...typography.bodySm, color: colors.textMuted, lineHeight: 20 },
    error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.sm },
  });
}
