import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDate, str } from '@/lib/utils';
import { documentsService, partnersService } from '@/services';
import { colors, spacing, typography } from '@/theme';

export function PartnerKycScreen() {
  const { partnerId } = useAuth();

  const partner = useQuery({
    queryKey: ['partner', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const docs = useQuery({
    queryKey: ['partner-kyc-docs', partnerId],
    queryFn: () =>
      documentsService.list({
        partnerId,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!partnerId,
  });

  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');

  return (
    <Screen title="Partner KYC" subtitle="Complete verification to activate payouts">
      <Card title="KYC Status">
        <View style={styles.statusRow}>
          <StatusBadge status={kycStatus} />
          <Text style={styles.muted}>Updated {formatDate(partner.data?.updatedAt as string)}</Text>
        </View>
      </Card>

      <Card title="Required Documents" subtitle="Upload via Profile → Documents">
        {(docs.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No KYC documents" description="Upload PAN, Aadhaar and agreement copies" />
        ) : (
          docs.data?.items.map((doc) => (
            <View key={String(doc.id)} style={styles.docRow}>
              <Text style={styles.docName}>{str(doc.fileName ?? doc.documentTypeName)}</Text>
              <StatusBadge status={str(doc.status)} />
            </View>
          ))
        )}
      </Card>

      <Text style={styles.note}>
        KYC is reviewed by Kuber Finserve compliance. You will be notified once approved.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { ...typography.caption, color: colors.textMuted },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  docName: { ...typography.bodySm, color: colors.text, flex: 1 },
  note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
});
