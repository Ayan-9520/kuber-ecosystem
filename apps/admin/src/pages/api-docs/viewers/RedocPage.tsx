import { RedocViewer } from '@/components/redoc';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useOpenApiSpec } from '@/lib/openapi';

export function RedocPage() {
  const { data: spec, isLoading, isError } = useOpenApiSpec();

  if (isLoading) return <LoadingSpinner />;

  if (isError || !spec) {
    return <EmptyState title="Failed to load OpenAPI spec" description="Ensure openapi/kuberone-v1.yaml is available." />;
  }

  return (
    <div className="api-docs-page" style={{ maxWidth: 'none' }}>
      <header className="api-docs-hero">
        <h1>Redoc</h1>
        <p>Readable, three-panel API reference documentation.</p>
      </header>
      <RedocViewer spec={spec} />
    </div>
  );
}
