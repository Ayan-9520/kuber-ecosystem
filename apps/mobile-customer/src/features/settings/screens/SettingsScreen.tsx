import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { Card, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, str } from '@/lib/utils';
import { notificationsService } from '@/services';
import { colors, spacing, typography } from '@/theme';

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

  const preferences = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: () => notificationsService.preferences(user!.id),
    enabled: !!user?.id,
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
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
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
    <Screen scroll>
      <ThemeAppearanceCard />
      <Card title="Notification Preferences" subtitle="Choose how you receive updates">
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
                      trackColor={{ false: colors.border, true: 'rgba(34,211,166,0.35)' }}
                      thumbColor={enabled ? colors.primary : colors.textMuted}
                    />
                  </View>
                );
              })}
            </View>
          ))
        )}
        {preferences.isError && (
          <Text style={styles.error}>{getApiErrorMessage(preferences.error)}</Text>
        )}
        {upsert.isError && (
          <Text style={styles.error}>{getApiErrorMessage(upsert.error)}</Text>
        )}
      </Card>

      <Card title="App Information">
        <InfoRow icon="phone-portrait-outline" label="App" value="KuberOne Customer" />
        <InfoRow icon="git-branch-outline" label="Version" value={appVersion} />
        <InfoRow icon="build-outline" label="Build" value={String(buildNumber)} />
        <InfoRow
          icon="server-outline"
          label="API"
          value={Constants.expoConfig?.extra?.apiBaseUrl as string ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? '—'}
        />
        {user?.email && <InfoRow icon="mail-outline" label="Account" value={user.email} />}
        {user?.phone && <InfoRow icon="call-outline" label="Phone" value={user.phone} />}
      </Card>

      <Card title="About">
        <Text style={styles.aboutText}>
          KuberOne is your premium fintech companion for home loans, business loans, auto loans,
          eligibility checks, document management, and AI-powered loan guidance.
        </Text>
        <Text style={styles.copyright}>© {new Date().getFullYear()} KuberFinServe</Text>
      </Card>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  channelGroup: { marginBottom: spacing.lg },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  channelTitle: { ...typography.label, color: colors.text, fontSize: 15 },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prefText: { flex: 1, marginRight: spacing.md },
  prefLabel: { ...typography.body, color: colors.text },
  prefMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.bodySm, color: colors.textMuted, width: 72 },
  infoValue: { ...typography.body, color: colors.text, flex: 1, textAlign: 'right' },
  aboutText: { ...typography.bodySm, color: colors.textMuted, lineHeight: 20 },
  copyright: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.md },
  muted: { ...typography.bodySm, color: colors.textMuted },
  error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.sm },
});
