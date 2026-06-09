import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { ragService } from '@/services/rag.service';

export function RagDocumentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const doc = useQuery({
    queryKey: ['rag-document', id],
    queryFn: () => ragService.getDocument(id!),
    enabled: !!id,
  });

  if (doc.isLoading) return <LoadingSpinner />;
  if (doc.isError || !doc.data) return <EmptyState title="Document not found" />;

  const data = doc.data;

  return (
    <div className="page-container">
      <PageHeader title={data.title} subtitle={`${data.sourceType} · ${data.chunkCount} chunks · ${data.embeddingCount} embeddings`} />

      <Card title="Embedding Status">
        <div className="info-grid">
          <div><div className="info-item-label">Status</div><StatusBadge status={data.status} /></div>
          <div><div className="info-item-label">Ingestion</div><div className="info-item-value">{data.ingestionStatus}</div></div>
          <div><div className="info-item-label">Chunks</div><div className="info-item-value">{data.chunkCount}</div></div>
          <div><div className="info-item-label">Embeddings</div><div className="info-item-value">{data.embeddingCount}</div></div>
          <div><div className="info-item-label">Indexed At</div><div className="info-item-value">{data.indexedAt ? formatDateTime(data.indexedAt) : '—'}</div></div>
        </div>
      </Card>

      <Card title="Chunk Viewer" className="detail-section">
        {(data.chunks ?? []).length === 0 ? (
          <EmptyState title="No chunks" description="Document may still be processing" />
        ) : (
          data.chunks!.map((chunk) => (
            <div key={chunk.id} className="list-row">
              <div>
                <div className="info-item-value">Chunk #{chunk.chunkIndex}</div>
                <div className="info-item-label" style={{ whiteSpace: 'pre-wrap' }}>{chunk.content}</div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
