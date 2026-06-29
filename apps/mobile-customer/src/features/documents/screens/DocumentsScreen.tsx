import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatDocumentTypeLabel } from '@kuberone/shared-utils';
import { Button, Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { guessMimeType } from '@/lib/document-checklist';
import { pickDocumentBase64 } from '@/lib/read-file-base64';
import { formatDate, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import { documentsService, productsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

export function DocumentsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { customerId } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadTypeId, setUploadTypeId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  const documents = useQuery({
    queryKey: ['documents', customerId],
    queryFn: () => documentsService.list({ customerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!customerId,
  });

  const documentTypes = useQuery({
    queryKey: ['document-types'],
    queryFn: () => productsService.documentTypes(),
  });

  const detail = useQuery({
    queryKey: ['document', selectedId],
    queryFn: () => documentsService.getById(selectedId!),
    enabled: !!selectedId,
  });

  const ocr = useQuery({
    queryKey: ['document-ocr', selectedId],
    queryFn: () => documentsService.ocrResults(selectedId!),
    enabled: !!selectedId,
  });

  const verification = useQuery({
    queryKey: ['document-verification', selectedId],
    queryFn: () => documentsService.verificationResults(selectedId!),
    enabled: !!selectedId,
  });

  const deficiencies = useQuery({
    queryKey: ['document-deficiencies', selectedId],
    queryFn: () => documentsService.deficiencies({ documentId: selectedId, limit: 20 }),
    enabled: !!selectedId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (documentTypeId: string) => {
      if (!customerId) throw new Error('Customer not linked');

      const picked = await pickDocumentBase64(['application/pdf', 'image/*']);
      if (!picked) {
        throw new Error('Upload cancelled');
      }

      return documentsService.upload({
        ownerType: 'CUSTOMER',
        customerId,
        documentTypeId,
        fileName: picked.name,
        mimeType: guessMimeType(picked.name, picked.mimeType),
        contentBase64: picked.contentBase64,
        runOcr: true,
        autoVerify: false,
      });
    },
    onSuccess: async () => {
      setUploadError('');
      setUploadTypeId(null);
      await queryClient.invalidateQueries({ queryKey: ['documents', customerId] });
    },
    onError: (e) => {
      const msg = getApiErrorMessage(e);
      if (msg !== 'Upload cancelled') setUploadError(msg);
    },
  });

  const closeDetail = () => setSelectedId(null);

  const detailLoading = detail.isLoading || ocr.isLoading || verification.isLoading || deficiencies.isLoading;

  return (
    <Screen title="Documents" subtitle="Upload and track your documents" loading={documents.isLoading}>
      {uploadError ? <Text style={styles.error}>{uploadError}</Text> : null}

      <Card title="Upload Document" subtitle="Select type then pick a file">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {(documentTypes.data?.items ?? []).map((type) => (
            <Pressable
              key={String(type.id)}
              style={[styles.typeChip, uploadTypeId === type.id && styles.typeChipActive]}
              onPress={() => setUploadTypeId(String(type.id))}
            >
              <Text style={[styles.typeChipText, uploadTypeId === type.id && styles.typeChipTextActive]}>
                {formatDocumentTypeLabel(type)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Button
          title="Pick & Upload"
          fullWidth
          loading={uploadMutation.isPending}
          disabled={!uploadTypeId}
          onPress={() => uploadTypeId && uploadMutation.mutate(uploadTypeId)}
          icon={<Ionicons name="cloud-upload-outline" size={18} color={colors.background} />}
        />
      </Card>

      <Card title="Your Documents">
        {(documents.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No documents yet" description="Upload KYC and income documents to proceed" />
        ) : (
          documents.data?.items.map((doc) => (
            <Pressable key={String(doc.id)} style={styles.docRow} onPress={() => setSelectedId(String(doc.id))}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{str(doc.fileName ?? formatDocumentTypeLabel(doc.documentType, doc))}</Text>
                <Text style={styles.docSub}>
                  {formatDocumentTypeLabel(doc.documentType, doc)} · {formatDate(doc.createdAt as string)}
                </Text>
              </View>
              <StatusBadge status={str(doc.status)} />
            </Pressable>
          ))
        )}
      </Card>

      <Modal visible={!!selectedId} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeDetail}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Detail</Text>
            <Pressable onPress={closeDetail} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {detailLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailName}>{str(detail.data?.fileName)}</Text>
                <StatusBadge status={str(detail.data?.status)} />
              </View>
              <Text style={styles.detailMeta}>
                Uploaded {formatDateTime(detail.data?.createdAt as string)}
              </Text>

              <Text style={styles.sectionLabel}>OCR Results</Text>
              {(ocr.data?.items.length ?? 0) === 0 ? (
                <Text style={styles.muted}>No OCR data available</Text>
              ) : (
                ocr.data?.items.map((item) => (
                  <View key={String(item.id)} style={styles.infoBlock}>
                    <Text style={styles.infoTitle}>{str(item.provider ?? 'OCR')}</Text>
                    {item.extractedFields && typeof item.extractedFields === 'object' ? (
                      Object.entries(item.extractedFields as Record<string, unknown>).map(([k, v]) => (
                        <Text key={k} style={styles.infoLine}>
                          {k}: {str(v)}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.infoLine}>{str(item.rawText ?? item.summary)}</Text>
                    )}
                    <Text style={styles.infoMeta}>Confidence: {str(item.confidenceScore ?? '—')}</Text>
                  </View>
                ))
              )}

              <Text style={styles.sectionLabel}>Verification</Text>
              {(verification.data?.items.length ?? 0) === 0 ? (
                <Text style={styles.muted}>Not yet verified</Text>
              ) : (
                verification.data?.items.map((item) => (
                  <View key={String(item.id)} style={styles.infoBlock}>
                    <View style={styles.verifyRow}>
                      <StatusBadge status={str(item.result ?? item.status)} />
                      <Text style={styles.infoMeta}>{str(item.verificationMode ?? item.mode)}</Text>
                    </View>
                    {item.notes ? <Text style={styles.infoLine}>{str(item.notes)}</Text> : null}
                    {item.rejectionReason ? (
                      <Text style={styles.rejectReason}>{str(item.rejectionReason)}</Text>
                    ) : null}
                  </View>
                ))
              )}

              <Text style={styles.sectionLabel}>Deficiencies</Text>
              {(deficiencies.data?.items.length ?? 0) === 0 ? (
                <Text style={styles.muted}>No deficiencies reported</Text>
              ) : (
                deficiencies.data?.items.map((item) => (
                  <View key={String(item.id)} style={styles.deficiencyBlock}>
                    <View style={styles.verifyRow}>
                      <StatusBadge status={str(item.status)} />
                      <Text style={styles.deficiencyType}>{str(item.deficiencyType ?? item.type)}</Text>
                    </View>
                    <Text style={styles.infoLine}>{str(item.description ?? item.notes)}</Text>
                    {item.resolutionNotes ? (
                      <Text style={styles.infoMeta}>Resolution: {str(item.resolutionNotes)}</Text>
                    ) : null}
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  typeRow: { gap: spacing.sm, paddingBottom: spacing.md },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(34,211,166,0.12)' },
  typeChipText: { ...typography.bodySm, color: colors.textSecondary },
  typeChipTextActive: { color: colors.primary },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34,211,166,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docName: { ...typography.label, color: colors.text },
  docSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  detailName: { ...typography.h3, color: colors.text, flex: 1 },
  detailMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.sm },
  muted: { ...typography.bodySm, color: colors.textMuted },
  infoBlock: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  infoTitle: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  infoLine: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  infoMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.xs },
  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  rejectReason: { ...typography.bodySm, color: colors.danger, marginTop: spacing.xs },
  deficiencyBlock: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  deficiencyType: { ...typography.bodySm, color: colors.warning },
});
}
