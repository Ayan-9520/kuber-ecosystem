import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatDate, str } from '@/lib/utils';
import { documentsService, partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

export function PartnerKycStatusScreen() {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, pagePad),
    [colors, isDesktop, pagePad],
  );
  const { partnerId } = useAuth();

  const partner = useQuery({
    queryKey: ['partner-kyc', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const docs = useQuery({
    queryKey: ['partner-docs-kyc', partnerId],
    queryFn: () => documentsService.list({ partnerId, ownerType: 'PARTNER', limit: 30 }),
    enabled: !!partnerId,
  });

  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');

  return (
    <Screen scroll padded={false} loading={partner.isLoading}>
      <PageHero
        eyebrow="Compliance"
        title="KYC Status"
        subtitle="Track verification for payout activation"
        icon="shield-checkmark"
      />

      <View style={styles.body}>
        <Card elevated title="Verification status">
          <View style={styles.row}>
            <StatusBadge status={kycStatus} />
            <Text style={styles.date}>Since {formatDate(partner.data?.createdAt as string)}</Text>
          </View>
          {kycStatus === 'VERIFIED' ? (
            <View style={styles.banner}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.bannerText}>KYC approved. Partner access is unlocked.</Text>
            </View>
          ) : (
            <Text style={styles.note}>
              Upload PAN, Aadhaar, cancelled cheque and partnership agreement under Documents. When compliance
              verifies those files, overall KYC becomes Verified automatically.
            </Text>
          )}
        </Card>

        <Card elevated title="Submitted documents">
          {(docs.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No documents" description="Upload KYC documents from the Documents section" />
          ) : (
            docs.data?.items.map((doc) => (
              <View key={String(doc.id)} style={styles.docRow}>
                <Text style={styles.docName}>{str(doc.fileName ?? doc.documentTypeName)}</Text>
                <StatusBadge status={str(doc.status)} />
              </View>
            ))
          )}
        </Card>
      </View>
    </Screen>
  );
}

function createStyles(colors: AppColors, isDesktop: boolean, pagePad: number) {
  return StyleSheet.create({
    body: {
      paddingHorizontal: pagePad,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      maxWidth: isDesktop ? 920 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
    date: { ...typography.caption, color: colors.textMuted },
    note: { ...typography.bodySm, color: colors.textSecondary, marginTop: spacing.md, lineHeight: 20 },
    banner: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: `${colors.success}14`,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    bannerText: { ...typography.bodySm, color: colors.success, fontWeight: '600', flex: 1 },
    docRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: spacing.sm,
    },
    docName: { ...typography.bodySm, color: colors.text, flex: 1 },
  });
}
