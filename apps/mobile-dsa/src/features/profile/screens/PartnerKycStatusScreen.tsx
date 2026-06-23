import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDate, str } from '@/lib/utils';
import { documentsService, partnersService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

export function PartnerKycStatusScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { partnerId } = useAuth();

  const partner = useQuery({
    queryKey: ['partner-kyc', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const docs = useQuery({
    queryKey: ['partner-docs-kyc', partnerId],
    queryFn: () => documentsService.list({ partnerId, limit: 30 }),
    enabled: !!partnerId,
  });

  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');

  return (
    <Screen title="KYC Status">
      <Card title="Verification Status">
        <View style={styles.row}>
          <StatusBadge status={kycStatus} />
          <Text style={styles.date}>Since {formatDate(partner.data?.createdAt as string)}</Text>
        </View>
        <Text style={styles.note}>
          Complete KYC by uploading PAN, Aadhaar, cancelled cheque and partnership agreement under Documents.
        </Text>
      </Card>

      <Card title="Submitted Documents">
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
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { ...typography.caption, color: colors.textMuted },
  note: { ...typography.bodySm, color: colors.textSecondary, marginTop: spacing.md },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  docName: { ...typography.bodySm, color: colors.text, flex: 1 },
});
}
