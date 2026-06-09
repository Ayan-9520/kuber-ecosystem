import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDate, maskPhone, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { customerService, kycService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof ProfileStackParamList;
  subtitle?: string;
}

const MENU: MenuItem[] = [
  { label: 'KYC Verification', icon: 'shield-checkmark', route: 'Kyc', subtitle: 'PAN & Aadhaar' },
  { label: 'Documents', icon: 'folder-open', route: 'Documents', subtitle: 'Upload & track' },
  { label: 'Settings', icon: 'settings-outline', route: 'Settings', subtitle: 'Preferences' },
  { label: 'Edit Profile', icon: 'create-outline', route: 'EditProfile', subtitle: 'Name & email' },
];

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, customerId, logout } = useAuth();

  const customer = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId!),
    enabled: !!customerId,
  });

  const profile = useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: () => customerService.profile(customerId!),
    enabled: !!customerId,
  });

  const kyc = useQuery({
    queryKey: ['kyc-profile', customerId],
    queryFn: () => kycService.profile(customerId),
    enabled: !!customerId,
  });

  const fullName = [customer.data?.firstName, customer.data?.lastName].filter(Boolean).join(' ') || 'Customer';
  const email = str(profile.data?.alternateEmail ?? user?.email);
  const phone = user?.phone ? maskPhone(user.phone) : '—';
  const kycStatus = str(kyc.data?.overallStatus ?? customer.data?.kycStatus ?? 'NOT_STARTED');

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen title="Profile" subtitle="Manage your account" loading={customer.isLoading}>
      <Card>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.meta}>{email}</Text>
            <Text style={styles.meta}>{phone}</Text>
            <View style={styles.badgeRow}>
              <StatusBadge status={kycStatus} />
              {customer.data?.customerCode ? (
                <Text style={styles.code}>ID: {str(customer.data.customerCode)}</Text>
              ) : null}
            </View>
          </View>
        </View>
        {customer.data?.createdAt ? (
          <Text style={styles.since}>Member since {formatDate(customer.data.createdAt as string)}</Text>
        ) : null}
      </Card>

      <Text style={styles.sectionTitle}>Account</Text>
      {MENU.map((item) => (
        <Pressable
          key={item.route}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
          onPress={() => navigation.navigate(item.route)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon} size={20} color={colors.primary} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.subtitle ? <Text style={styles.menuSub}>{item.subtitle}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}

      <View style={styles.logoutWrap}>
        <Button title="Logout" variant="danger" fullWidth onPress={confirmLogout} icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,211,166,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h2, color: colors.primary, fontSize: 26 },
  avatarInfo: { flex: 1 },
  name: { ...typography.h3, color: colors.text },
  meta: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  code: { ...typography.bodySm, color: colors.textSecondary },
  since: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.md },
  sectionTitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  menuPressed: { opacity: 0.9 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34,211,166,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { ...typography.label, color: colors.text },
  menuSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  logoutWrap: { marginTop: spacing.lg, marginBottom: spacing.xl },
});
