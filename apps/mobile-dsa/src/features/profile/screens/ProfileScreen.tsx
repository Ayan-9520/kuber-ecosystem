import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { maskPhone, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService } from '@/services';
import { colors, spacing, typography } from '@/theme';

const MENU: { label: string; screen: keyof ProfileStackParamList; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Bank Account', screen: 'BankAccount', icon: 'card' },
  { label: 'KYC Status', screen: 'PartnerKycStatus', icon: 'shield-checkmark' },
  { label: 'Documents', screen: 'Documents', icon: 'folder' },
  { label: 'Document Deficiencies', screen: 'DocumentDeficiencies', icon: 'alert-circle' },
  { label: 'Customers', screen: 'CustomersList', icon: 'people' },
  { label: 'Referrals', screen: 'Referrals', icon: 'gift' },
  { label: 'Referral Analytics', screen: 'ReferralAnalytics', icon: 'analytics' },
  { label: 'Support', screen: 'Support', icon: 'headset' },
  { label: 'Settings', screen: 'Settings', icon: 'settings' },
];

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { user, partnerId, logout } = useAuth();

  const partner = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const displayName = str(partner.data?.contactName ?? partner.data?.businessName ?? user?.phone);
  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');

  return (
    <Screen scroll>
      <Card>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.sub}>{partner.data?.businessName ? String(partner.data.businessName) : 'DSA Partner'}</Text>
        <Text style={styles.sub}>{user?.phone ? maskPhone(user.phone) : user?.email}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={kycStatus} />
          <StatusBadge status={str(partner.data?.status ?? 'ACTIVE')} />
        </View>
        {partner.data?.partnerCode ? (
          <Text style={styles.code}>Partner Code: {String(partner.data.partnerCode)}</Text>
        ) : null}
      </Card>

      <Card title="Account">
        {MENU.map((item) => (
          <Pressable
            key={item.screen}
            style={styles.menuRow}
            onPress={() => {
              switch (item.screen) {
                case 'BankAccount':
                  navigation.navigate('BankAccount');
                  break;
                case 'PartnerKycStatus':
                  navigation.navigate('PartnerKycStatus');
                  break;
                case 'Documents':
                  navigation.navigate('Documents');
                  break;
                case 'DocumentDeficiencies':
                  navigation.navigate('DocumentDeficiencies');
                  break;
                case 'CustomersList':
                  navigation.navigate('CustomersList');
                  break;
                case 'Referrals':
                  navigation.navigate('Referrals');
                  break;
                case 'ReferralAnalytics':
                  navigation.navigate('ReferralAnalytics');
                  break;
                case 'Support':
                  navigation.navigate('Support');
                  break;
                case 'Settings':
                  navigation.navigate('Settings');
                  break;
                default:
                  break;
              }
            }}
          >
            <Ionicons name={item.icon} size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <Button title="Sign Out" variant="secondary" fullWidth onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.background },
  name: { ...typography.h3, color: colors.text, textAlign: 'center' },
  sub: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  code: { ...typography.caption, color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
});
