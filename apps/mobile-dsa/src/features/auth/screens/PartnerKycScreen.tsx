import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { Button, Card, EmptyState, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { PARTNER_KYC_TYPE_CODES } from '@/lib/partnerKycDocuments';
import { formatDate, str } from '@/lib/utils';
import type { AuthStackParamList } from '@/navigation/types';
import { documentsService, partnersService } from '@/services';
import { setRequiresPartnerKyc } from '@/store/slices/authSlice';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

const STATUS_COPY: Record<string, string> = {
  NOT_STARTED: 'Upload required documents to start review.',
  IN_PROGRESS: 'Some documents are still pending. Finish uploads to continue.',
  SUBMITTED: 'Compliance is reviewing your files. Full access unlocks after KYC approval.',
  VERIFIED: 'KYC approved. You can open the partner dashboard.',
  REJECTED: 'KYC was rejected. Re-upload corrected documents or contact support.',
};

export function PartnerKycScreen() {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, pagePad),
    [colors, isDesktop, pagePad],
  );
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { partnerId } = useAuth();

  const partner = useQuery({
    queryKey: ['partner', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
    refetchInterval: (query) => {
      const status = str(query.state.data?.kycStatus);
      return status === 'SUBMITTED' || status === 'IN_PROGRESS' ? 12_000 : false;
    },
  });

  const docs = useQuery({
    queryKey: ['partner-kyc-docs', partnerId],
    queryFn: () =>
      documentsService.list({
        partnerId,
        ownerType: 'PARTNER',
        limit: 30,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!partnerId,
    refetchInterval: partner.data?.kycStatus === 'SUBMITTED' ? 12_000 : false,
  });

  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');
  const isVerified = kycStatus === 'VERIFIED';

  const docsByCode = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const doc of docs.data?.items ?? []) {
      const code = str(doc.documentTypeCode).toUpperCase();
      if (!code || map.has(code)) continue;
      map.set(code, doc);
    }
    return map;
  }, [docs.data?.items]);

  const verifiedCount = PARTNER_KYC_TYPE_CODES.filter((code) => {
    const doc = docsByCode.get(code);
    return str(doc?.status).toUpperCase() === 'VERIFIED';
  }).length;

  return (
    <Screen scroll padded={false} loading={partner.isLoading}>
      <PageHero
        eyebrow="Partner onboarding"
        title="Partner KYC"
        subtitle="Complete verification to activate payouts"
        icon="shield-checkmark"
      />

      <View style={styles.body}>
        <Card elevated title="KYC status">
          <View style={styles.statusRow}>
            <StatusBadge status={kycStatus} />
            <Text style={styles.statusHint}>{STATUS_COPY[kycStatus] ?? STATUS_COPY.SUBMITTED}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              Docs verified {verifiedCount}/{PARTNER_KYC_TYPE_CODES.length}
            </Text>
            <Text style={styles.metaLabel}>Updated {formatDate(partner.data?.updatedAt as string)}</Text>
          </View>
          {isVerified ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.successText}>All set — continue to your dashboard.</Text>
            </View>
          ) : null}
        </Card>

        <Card elevated title="Required documents" subtitle="PAN, Aadhaar, cheque & partnership agreement">
          {docs.isLoading ? (
            <Text style={styles.muted}>Loading documents…</Text>
          ) : (
            <View style={styles.checklist}>
              {PARTNER_KYC_TYPE_CODES.map((code) => {
                const doc = docsByCode.get(code);
                const status = str(doc?.status || (doc ? 'UPLOADED' : 'MISSING')).toUpperCase();
                const label = code === 'PARTNER_AGREEMENT' ? 'Partnership Agreement' : code === 'CHEQUE' ? 'Cancelled Cheque' : code.replace(/_/g, ' ');
                return (
                  <View key={code} style={styles.checkRow}>
                    <View style={styles.checkLeft}>
                      <Ionicons
                        name={
                          status === 'VERIFIED'
                            ? 'checkmark-circle'
                            : status === 'MISSING'
                              ? 'ellipse-outline'
                              : 'time-outline'
                        }
                        size={20}
                        color={
                          status === 'VERIFIED'
                            ? colors.success
                            : status === 'MISSING'
                              ? colors.textMuted
                              : colors.warning
                        }
                      />
                      <View style={styles.checkMeta}>
                        <Text style={styles.checkTitle}>{label}</Text>
                        <Text style={styles.checkHint}>
                          {status === 'MISSING'
                            ? 'Not uploaded yet'
                            : status === 'VERIFIED'
                              ? 'Verified by compliance'
                              : `On file · ${status.replace(/_/g, ' ').toLowerCase()}`}
                        </Text>
                      </View>
                    </View>
                    <StatusBadge status={status === 'MISSING' ? 'REQUIRED' : status} />
                  </View>
                );
              })}
            </View>
          )}

          {(docs.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No KYC documents" description="Upload PAN, Aadhaar, cheque and agreement" />
          ) : null}
        </Card>

        {!isVerified ? (
          <Pressable style={styles.noteCard} onPress={() => navigation.navigate('PartnerDocuments')}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.note}>
              KYC is reviewed by Kuber Finserve compliance. After documents are verified, overall status becomes Verified automatically.
            </Text>
          </Pressable>
        ) : null}

        {isVerified ? (
          <Button
            title="Continue to Dashboard"
            fullWidth
            onPress={() => dispatch(setRequiresPartnerKyc(false))}
          />
        ) : (
          <View style={styles.actions}>
            <Button
              title="Upload / manage documents"
              fullWidth
              onPress={() => navigation.navigate('PartnerDocuments')}
            />
            <Button
              title="Refresh status"
              variant="secondary"
              fullWidth
              loading={partner.isFetching}
              onPress={() => {
                void partner.refetch();
                void docs.refetch();
              }}
            />
          </View>
        )}
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
    statusRow: {
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'center' : 'flex-start',
      gap: spacing.sm,
    },
    statusHint: { ...typography.bodySm, color: colors.textSecondary, flex: 1 },
    metaRow: {
      marginTop: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    metaLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
    successBanner: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: `${colors.success}14`,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    successText: { ...typography.bodySm, color: colors.success, fontWeight: '600', flex: 1 },
    checklist: { gap: spacing.sm },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    checkLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 },
    checkMeta: { flex: 1, minWidth: 0 },
    checkTitle: { ...typography.bodySm, fontWeight: '600', color: colors.text },
    checkHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    muted: { ...typography.bodySm, color: colors.textMuted },
    noteCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: `${colors.primary}28`,
      backgroundColor: `${colors.primary}0C`,
    },
    note: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 18 },
    actions: { gap: spacing.sm },
  });
}
