import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { filterPartnerKycTypes, PARTNER_KYC_TYPE_CODES } from '@/lib/partnerKycDocuments';
import { readFileAsBase64 } from '@/lib/readFileAsBase64';
import { formatDate, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { documentsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

function guessMime(fileName: string, fallback?: string): string {
  if (fallback) return fallback;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return MIME_MAP[ext] ?? 'application/octet-stream';
}

function labelForCode(code: string, fallback?: string) {
  if (fallback) return fallback;
  if (code === 'PARTNER_AGREEMENT') return 'Partnership Agreement';
  if (code === 'CHEQUE') return 'Cancelled Cheque';
  return code.replace(/_/g, ' ');
}

export function DocumentsScreen() {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, pagePad),
    [colors, isDesktop, pagePad],
  );
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);

  const documents = useQuery({
    queryKey: ['partner-documents', partnerId],
    queryFn: () =>
      documentsService.list({ partnerId, ownerType: 'PARTNER', limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const types = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentsService.types({ limit: 50 }),
  });

  const kycTypes = useMemo(
    () => filterPartnerKycTypes(types.data?.items ?? []),
    [types.data?.items],
  );

  const typeByCode = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const t of kycTypes) {
      map.set(String(t.code), t);
    }
    return map;
  }, [kycTypes]);

  const latestByCode = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const doc of documents.data?.items ?? []) {
      const code = str(doc.documentTypeCode).toUpperCase();
      if (!code || map.has(code)) continue;
      map.set(code, doc);
    }
    return map;
  }, [documents.data?.items]);

  const uploadMutation = useMutation({
    mutationFn: async ({ documentTypeId, typeCode }: { documentTypeId: string; typeCode: string }) => {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ['application/pdf', 'image/*'],
      });
      if (result.canceled || !result.assets[0]) throw new Error('Upload cancelled');

      const asset = result.assets[0];
      const contentBase64 = await readFileAsBase64(asset.uri);

      return documentsService.upload({
        ownerType: 'PARTNER',
        partnerId,
        documentTypeId,
        fileName: asset.name,
        mimeType: guessMime(asset.name, asset.mimeType ?? undefined),
        contentBase64,
        runOcr: true,
        autoVerify: false,
        metadata: { kycTypeCode: typeCode },
      });
    },
    onSuccess: async () => {
      setError('');
      setUploadingCode(null);
      await queryClient.invalidateQueries({ queryKey: ['partner-documents'] });
      await queryClient.invalidateQueries({ queryKey: ['partner-kyc-docs'] });
      await queryClient.invalidateQueries({ queryKey: ['partner-docs-kyc'] });
      await queryClient.invalidateQueries({ queryKey: ['partner', partnerId] });
    },
    onError: (e) => {
      setUploadingCode(null);
      const msg = getApiErrorMessage(e);
      if (msg !== 'Upload cancelled') setError(msg);
    },
  });

  const pickAndUpload = (typeCode: string) => {
    const docType = typeByCode.get(typeCode);
    if (!docType?.id) {
      setError(`${typeCode} document type is not configured. Contact support.`);
      return;
    }
    setError('');
    setUploadingCode(typeCode);
    uploadMutation.mutate({ documentTypeId: String(docType.id), typeCode });
  };

  const verifiedCount = PARTNER_KYC_TYPE_CODES.filter(
    (code) => str(latestByCode.get(code)?.status).toUpperCase() === 'VERIFIED',
  ).length;

  return (
    <Screen scroll padded={false}>
      <PageHero
        eyebrow="Compliance"
        title="KYC Documents"
        subtitle="Upload PAN, Aadhaar, cancelled cheque and signed partnership agreement"
        icon="document-text"
      />

      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card
          elevated
          title="Upload checklist"
          subtitle={`${verifiedCount}/${PARTNER_KYC_TYPE_CODES.length} verified by compliance`}
        >
          {types.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : kycTypes.length === 0 ? (
            <Text style={styles.hint}>Document types loading failed. Pull to refresh or try again later.</Text>
          ) : (
            <View style={styles.checklist}>
              {PARTNER_KYC_TYPE_CODES.map((code) => {
                const docType = typeByCode.get(code);
                const label = labelForCode(code, str(docType?.name) || undefined);
                const latest = latestByCode.get(code);
                const status = str(latest?.status).toUpperCase();
                const done = Boolean(latest);
                const verified = status === 'VERIFIED';
                const busy = uploadingCode === code;
                return (
                  <Pressable
                    key={code}
                    style={[
                      styles.checkRow,
                      done && styles.checkRowDone,
                      verified && styles.checkRowVerified,
                    ]}
                    disabled={busy || uploadMutation.isPending}
                    onPress={() => pickAndUpload(code)}
                  >
                    <View style={styles.checkIcon}>
                      <Ionicons
                        name={verified ? 'shield-checkmark' : done ? 'cloud-done' : 'cloud-upload-outline'}
                        size={20}
                        color={verified ? colors.success : done ? colors.primary : colors.textMuted}
                      />
                    </View>
                    <View style={styles.checkMeta}>
                      <Text style={styles.checkTitle}>{label}</Text>
                      <Text style={styles.checkHint}>
                        {verified
                          ? 'Verified — tap to replace if needed'
                          : done
                            ? 'Uploaded — tap to replace'
                            : 'Tap to upload PDF or photo'}
                      </Text>
                    </View>
                    {busy ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <StatusBadge status={verified ? 'VERIFIED' : done ? 'UPLOADED' : 'REQUIRED'} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          <Button title="Advanced upload" variant="secondary" fullWidth onPress={() => navigation.navigate('UploadDocument')} />
          <Button title="View deficiencies" variant="ghost" fullWidth onPress={() => navigation.navigate('DocumentDeficiencies')} />
        </View>

        <Card elevated title="Your uploads" subtitle={`${documents.data?.meta.total ?? 0} on file`}>
          {(documents.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No documents yet" description="Use the checklist above to upload KYC files" />
          ) : (
            documents.data?.items.map((doc) => (
              <ListRow
                key={String(doc.id)}
                title={str(doc.documentTypeName ?? doc.fileName)}
                subtitle={formatDate(doc.createdAt as string)}
                status={str(doc.status)}
                icon="document"
              />
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
    error: { color: colors.danger, marginBottom: spacing.sm },
    hint: { ...typography.bodySm, color: colors.textSecondary },
    checklist: { gap: spacing.sm },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    checkRowDone: { borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}0A` },
    checkRowVerified: { borderColor: `${colors.success}55`, backgroundColor: `${colors.success}0C` },
    checkIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}12`,
    },
    checkMeta: { flex: 1, minWidth: 0 },
    checkTitle: { ...typography.bodySm, fontWeight: '600', color: colors.text },
    checkHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    actions: { gap: spacing.xs },
  });
}
