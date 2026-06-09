import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, DataTable, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { ragService } from '@/services/rag.service';

export function RagIngestionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('TXT');

  const documents = useQuery({ queryKey: ['rag-documents-all'], queryFn: () => ragService.documents({ limit: 50 }) });

  const ingestMutation = useMutation({
    mutationFn: () => ragService.ingest({ title, content, sourceType }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: ['rag-documents-all'] });
    },
  });

  const ingestAllMutation = useMutation({
    mutationFn: () => ragService.ingestAllPublished(100),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['rag-documents-all'] }),
  });

  if (documents.isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <PageHeader title="Document Ingestion" subtitle="Ingest knowledge articles and documents into the RAG vector index" />

      <Card title="Ingest New Document">
        <div className="form-grid">
          <div className="form-group">
            <label className="info-item-label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="info-item-label">Source Type</label>
            <select className="input" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              {['TXT', 'MD', 'HTML', 'PDF', 'DOCX', 'POLICY', 'FAQ', 'SOP', 'KNOWLEDGE_ARTICLE'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="info-item-label">Content (extracted text for PDF/DOCX)</label>
            <textarea className="input" rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Button onClick={() => ingestMutation.mutate()} disabled={!title || !content}>Ingest Document</Button>
          <Button variant="secondary" onClick={() => ingestAllMutation.mutate()} disabled={ingestAllMutation.isPending}>
            Ingest All Published Articles
          </Button>
        </div>
      </Card>

      <Card title="Indexed Documents" className="detail-section">
        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'sourceType', label: 'Type' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
            { key: 'ingestionStatus', label: 'Ingestion', render: (r) => String(r.ingestionStatus) },
            { key: 'chunkCount', label: 'Chunks' },
            { key: 'embeddingCount', label: 'Embeddings' },
          ]}
          data={(documents.data?.items ?? []) as unknown as Record<string, unknown>[]}
          onRowClick={(r) => navigate(`/rag/documents/${r.id}`)}
        />
      </Card>
    </div>
  );
}
