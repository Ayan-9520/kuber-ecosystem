import Constants from 'expo-constants';
import { StyleSheet, Text } from 'react-native';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { Button, Card, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { colors, spacing, typography } from '@/theme';

export function SettingsScreen() {
  const { logout, user, partnerId } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? Constants.expoConfig?.extra?.apiBaseUrl ?? '—';

  return (
    <Screen scroll title="Settings">
      <ThemeAppearanceCard />
      <Card title="Session">
        <Text style={styles.row}>User ID: {user?.id ?? '—'}</Text>
        <Text style={styles.row}>Partner ID: {partnerId ?? '—'}</Text>
        <Text style={styles.row}>Role: {user?.roles?.join(', ') ?? 'DSA_PARTNER'}</Text>
        <Text style={styles.row}>Data Scope: {user?.dataScope ?? 'OWN'}</Text>
      </Card>

      <Card title="API Configuration">
        <Text style={styles.api}>{apiUrl}</Text>
        <Text style={styles.hint}>Set EXPO_PUBLIC_API_BASE_URL in .env for device testing</Text>
      </Card>

      <Card title="About">
        <Text style={styles.row}>KuberOne DSA Partner App v1.0.0</Text>
        <Text style={styles.row}>Kuber Finserve</Text>
      </Card>

      <Button title="Sign Out" variant="secondary" fullWidth onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { ...typography.bodySm, color: colors.textSecondary, marginBottom: spacing.xs },
  api: { ...typography.body, color: colors.primary, fontFamily: 'monospace' },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});
