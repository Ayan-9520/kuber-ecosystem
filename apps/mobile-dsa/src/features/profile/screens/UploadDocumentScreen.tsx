import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage } from '@/lib/utils';
import { documentsService } from '@/services';
import { colors, spacing } from '@/theme';

export function UploadDocumentScreen() {
  const { partnerId } = useAuth();
  const queryClient = useQueryClient();
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [error, setError] = useState('');

  const types = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentsService.types({ limit: 50 }),
  });

  const defaultType = types.data?.items[0];

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const typeId = documentTypeId || String(defaultType?.id ?? '');
      if (!typeId) throw new Error('Select a document type');

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/pdf', 'image/*'],
      });
      if (result.canceled || !result.assets[0]) throw new Error('Upload cancelled');

      const asset = result.assets[0];
      const contentBase64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

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
      await queryClient.invalidateQueries({ queryKey: ['partner-documents'] });
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  return (
    <Screen title="Upload Document">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label={`Document Type ID (${String(defaultType?.name ?? 'from list')})`}
        placeholder="Leave blank for default type"
        value={documentTypeId}
        onChangeText={setDocumentTypeId}
      />
      <Button title="Pick & Upload" fullWidth loading={uploadMutation.isPending} onPress={() => uploadMutation.mutate()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
});
