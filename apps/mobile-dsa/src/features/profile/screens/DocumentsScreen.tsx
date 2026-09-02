import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { filterPartnerKycTypes, PARTNER_KYC_TYPE_CODES } from '@/lib/partnerKycDocuments';
import { readFileAsBase64 } from '@/lib/readFileAsBase64';
import { formatDate, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { documentsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

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

export function DocumentsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const uploadedCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const doc of documents.data?.items ?? []) {
      const code = str(doc.documentTypeCode ?? doc.documentTypeName);
      if (code) codes.add(code.toUpperCase());
    }
    return codes;
  }, [documents.data?.items]);

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

  return (
    <Screen scroll>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card
        title="KYC Documents"
        subtitle="Upload PAN, Aadhaar, cancelled cheque and signed partnership agreement"
      >
        {types.isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : kycTypes.length === 0 ? (
          <Text style={styles.hint}>Document types loading failed. Pull to refresh or try again later.</Text>
        ) : (
          <View style={styles.checklist}>
            {PARTNER_KYC_TYPE_CODES.map((code) => {
              const docType = typeByCode.get(code);
              const label = str(docType?.name ?? code.replace(/_/g, ' '));
              const done = uploadedCodes.has(code);
              const busy = uploadingCode === code;
              return (
                <Pressable
                  key={code}
                  style={[styles.checkRow, done && styles.checkRowDone]}
                  disabled={busy || uploadMutation.isPending}
                  onPress={() => pickAndUpload(code)}
                >
                  <View style={styles.checkMeta}>
                    <Text style={styles.checkTitle}>{label}</Text>
                    <Text style={styles.checkHint}>{done ? 'Uploaded — tap to replace' : 'Tap to upload PDF or photo'}</Text>
                  </View>
                  {busy ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[styles.checkBadge, done ? styles.checkBadgeDone : styles.checkBadgePending]}>
                      {done ? 'Done' : 'Required'}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </Card>

      <Button title="Advanced upload" variant="secondary" fullWidth onPress={() => navigation.navigate('UploadDocument')} />
      <Button title="View deficiencies" variant="ghost" fullWidth onPress={() => navigation.navigate('DocumentDeficiencies')} />

      <Card title="Your uploads" subtitle={`${documents.data?.meta.total ?? 0} on file`}>
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
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    error: { color: colors.danger, marginBottom: spacing.md },
    hint: { ...typography.bodySm, color: colors.textSecondary },
    checklist: { gap: spacing.sm },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    checkRowDone: { borderColor: colors.primary, backgroundColor: `${colors.primary}08` },
    checkMeta: { flex: 1, paddingRight: spacing.sm },
    checkTitle: { ...typography.bodySm, fontWeight: '600', color: colors.text },
    checkHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    checkBadge: {
      ...typography.caption,
      fontWeight: '700',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: 'hidden',
    },
    checkBadgePending: { color: colors.warning, backgroundColor: `${colors.warning}18` },
    checkBadgeDone: { color: colors.primary, backgroundColor: `${colors.primary}18` },
  });
}
