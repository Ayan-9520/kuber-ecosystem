import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDate, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { documentsService } from '@/services';
import { colors, spacing } from '@/theme';

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
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const documents = useQuery({
    queryKey: ['partner-documents', partnerId],
    queryFn: () => documentsService.list({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const types = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentsService.types({ limit: 50 }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (documentTypeId: string) => {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
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
        documentTypeId,
        fileName: asset.name,
        mimeType: guessMime(asset.name, asset.mimeType ?? undefined),
        contentBase64,
        runOcr: true,
        autoVerify: false,
      });
    },
    onSuccess: async () => {
      setError('');
      await queryClient.invalidateQueries({ queryKey: ['partner-documents'] });
    },
    onError: (e) => {
      const msg = getApiErrorMessage(e);
      if (msg !== 'Upload cancelled') setError(msg);
    },
  });

  const defaultTypeId = types.data?.items[0]?.id as string | undefined;

  return (
    <Screen scroll>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Upload Document"
        fullWidth
        onPress={() => navigation.navigate('UploadDocument')}
      />
      <Button
        title="Quick Upload"
        variant="secondary"
        fullWidth
        loading={uploadMutation.isPending}
        onPress={() => defaultTypeId && uploadMutation.mutate(String(defaultTypeId))}
      />
      <Button
        title="View Deficiencies"
        variant="ghost"
        fullWidth
        onPress={() => navigation.navigate('DocumentDeficiencies')}
      />

      <Card title="Your Documents" subtitle={`${documents.data?.meta.total ?? 0} uploaded`}>
        {(documents.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No documents" description="Upload KYC and agreement documents" />
        ) : (
          documents.data?.items.map((doc) => (
            <ListRow
              key={String(doc.id)}
              title={str(doc.fileName ?? doc.documentTypeName)}
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

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
});
