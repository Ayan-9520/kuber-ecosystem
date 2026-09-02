import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { filterPartnerKycTypes } from '@/lib/partnerKycDocuments';
import { readFileAsBase64 } from '@/lib/readFileAsBase64';
import { getApiErrorMessage, str } from '@/lib/utils';
import { documentsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

export function UploadDocumentScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { partnerId } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [error, setError] = useState('');

  const types = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentsService.types({ limit: 50 }),
  });

  const kycTypes = useMemo(
    () => filterPartnerKycTypes(types.data?.items ?? []),
    [types.data?.items],
  );

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const typeId = selectedTypeId || String(kycTypes[0]?.id ?? '');
      if (!typeId) throw new Error('Select a document type');

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/pdf', 'image/*'],
      });
      if (result.canceled || !result.assets[0]) throw new Error('Upload cancelled');

      const asset = result.assets[0];
      const contentBase64 = await readFileAsBase64(asset.uri);

      return documentsService.upload({
        ownerType: 'PARTNER',
        partnerId,
        documentTypeId: typeId,
        fileName: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        contentBase64,
        runOcr: true,
      });
    },
    onSuccess: async () => {
      setError('');
      await queryClient.invalidateQueries({ queryKey: ['partner-documents'] });
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  return (
    <Screen title="Upload Document" subtitle="Choose document type, then pick a PDF or photo">
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {types.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={styles.typeList}>
          {kycTypes.map((t) => {
            const id = String(t.id);
            const selected = selectedTypeId === id || (!selectedTypeId && id === String(kycTypes[0]?.id));
            return (
              <Pressable
                key={id}
                style={[styles.typeChip, selected && styles.typeChipSelected]}
                onPress={() => setSelectedTypeId(id)}
              >
                <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{str(t.name)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Button
        title="Pick file & upload"
        fullWidth
        loading={uploadMutation.isPending}
        onPress={() => uploadMutation.mutate()}
      />
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    error: { color: colors.danger, marginBottom: spacing.md },
    typeList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    typeChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    typeChipSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
    typeChipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
    typeChipTextSelected: { color: colors.primary },
  });
}
