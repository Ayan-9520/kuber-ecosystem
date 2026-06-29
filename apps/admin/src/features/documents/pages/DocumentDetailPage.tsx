import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CanAccess } from '@/components/guards/CanAccess';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  LoadingSpinner,
  PageHeader,
  StatusBadge,
} from '@/components/ui';
import { formatDateTime, getApiErrorMessage } from '@/lib/utils';
import { customerDisplayName, documentNumberDisplay, documentTypeDisplay } from '@/lib/entity-display';
import { documentsService } from '@/services/index';

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="info-item-label">{label}</div>
      <div className="info-item-value">{value}</div>
    </div>
  );
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [verifyNotes, setVerifyNotes] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const document = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsService.getById(id!),
    enabled: !!id,
  });

  const ocrResults = useQuery({
    queryKey: ['document-ocr', id],
    queryFn: () => documentsService.ocrResults({ documentId: id!, page: 1, limit: 10 }),
    enabled: !!id,
  });

  const verificationResults = useQuery({
    queryKey: ['document-verification', id],
    queryFn: () => documentsService.verificationResults({ documentId: id!, page: 1, limit: 10 }),
    enabled: !!id,
  });

  const deficiencies = useQuery({
    queryKey: ['document-deficiencies', id],
    queryFn: () => documentsService.deficiencies({ documentId: id!, page: 1, limit: 20 }),
    enabled: !!id,
  });

  const verifyMutation = useMutation({
    mutationFn: () => documentsService.verify(id!, { notes: verifyNotes || undefined }),
    onSuccess: () => {
      setActionSuccess('Document verified successfully');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['document-verification', id] });
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => documentsService.approve(id!),
    onSuccess: () => {
      setActionSuccess('Document approved successfully');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  if (document.isLoading) return <LoadingSpinner />;
  if (document.isError || !document.data) {
    return (
      <div className="page-container">
        <EmptyState title="Document not found" />
        <Button variant="secondary" onClick={() => navigate('/documents')} style={{ marginTop: '1rem' }}>
          Back to Documents
        </Button>
      </div>
    );
  }

  const data = document.data;
  const isActionLoading = verifyMutation.isPending || approveMutation.isPending;

  return (
    <div className="page-container">
      <PageHeader
        title={documentTypeDisplay(data)}
        subtitle={`Document ${documentNumberDisplay(data)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/documents')}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <StatusBadge status={str(data.status)} />
        {data.verificationStatus != null && String(data.verificationStatus) !== '' ? (
          <StatusBadge status={str(data.verificationStatus)} />
        ) : null}
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      <div className="detail-grid">
        <div>
          <Card title="Document Preview" className="detail-section">
            <div className="info-grid">
              <InfoItem label="Document Type" value={documentTypeDisplay(data)} />
              <InfoItem label="Customer" value={customerDisplayName(data)} />
              <InfoItem label="Application" value={str(data.applicationId)} />
              <InfoItem label="File Name" value={str(data.fileName ?? data.originalFileName)} />
              <InfoItem label="MIME Type" value={str(data.mimeType)} />
              <InfoItem label="File Size" value={data.fileSize ? `${Math.round(Number(data.fileSize) / 1024)} KB` : '—'} />
              <InfoItem label="Uploaded" value={formatDateTime((data.uploadedAt ?? data.createdAt) as string)} />
              <InfoItem label="Uploaded By" value={str(data.uploadedByName ?? data.uploadedBy)} />
            </div>
            {typeof data.fileUrl === 'string' && data.fileUrl ? (
              <div style={{ marginTop: '1rem' }}>
                <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  Open Document
                </a>
              </div>
            ) : null}
          </Card>

          <Card title="OCR Results" className="detail-section">
            {ocrResults.isLoading ? (
              <LoadingSpinner />
            ) : (ocrResults.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No OCR data" description="OCR extraction results will appear here." />
            ) : (
              <DataTable
                columns={[
                  { key: 'fieldName', header: 'Field', render: (r) => str(r.fieldName ?? r.key) },
                  { key: 'extractedValue', header: 'Extracted', render: (r) => str(r.extractedValue ?? r.value) },
                  { key: 'confidence', header: 'Confidence', render: (r) => (r.confidence ? `${r.confidence}%` : '—') },
                ]}
                data={ocrResults.data?.items ?? []}
              />
            )}
          </Card>

          <Card title="Verification Results">
            {verificationResults.isLoading ? (
              <LoadingSpinner />
            ) : (verificationResults.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="Not yet verified" />
            ) : (
              <DataTable
                columns={[
                  { key: 'checkType', header: 'Check', render: (r) => str(r.checkType ?? r.type) },
                  {
                    key: 'result',
                    header: 'Result',
                    render: (r) => <StatusBadge status={str(r.result ?? r.status)} />,
                  },
                  { key: 'verifiedAt', header: 'Verified', render: (r) => formatDateTime(r.verifiedAt as string) },
                ]}
                data={verificationResults.data?.items ?? []}
              />
            )}
          </Card>
        </div>

        <div>
          <Card title="Actions" className="detail-section">
            <Input
              label="Verification Notes"
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="Optional notes for verification"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <CanAccess permission="documents.verify">
                <Button
                  loading={verifyMutation.isPending}
                  disabled={isActionLoading}
                  onClick={() => verifyMutation.mutate()}
                >
                  <ShieldCheck size={16} />
                  Verify Document
                </Button>
              </CanAccess>
              <CanAccess permission="documents.approve">
                <Button
                  variant="secondary"
                  loading={approveMutation.isPending}
                  disabled={isActionLoading}
                  onClick={() => approveMutation.mutate()}
                >
                  <CheckCircle size={16} />
                  Approve Document
                </Button>
              </CanAccess>
            </div>
          </Card>

          <Card title="Deficiencies">
            {deficiencies.isLoading ? (
              <LoadingSpinner />
            ) : (deficiencies.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No deficiencies" description="This document has no reported issues." />
            ) : (
              <DataTable
                columns={[
                  { key: 'deficiencyType', header: 'Type', render: (r) => str(r.deficiencyType ?? r.type) },
                  { key: 'description', header: 'Description', render: (r) => str(r.description) },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (r) => <StatusBadge status={str(r.status)} />,
                  },
                ]}
                data={deficiencies.data?.items ?? []}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
