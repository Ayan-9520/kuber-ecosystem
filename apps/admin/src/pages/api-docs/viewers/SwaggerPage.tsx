import { SwaggerViewer } from '@/components/swagger';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useOpenApiSpec } from '@/lib/openapi';

export function SwaggerPage() {
  const { data: spec, isLoading, isError } = useOpenApiSpec();

  if (isLoading) return <LoadingSpinner />;

  if (isError || !spec) {
    return <EmptyState title="Failed to load OpenAPI spec" description="Ensure openapi/kuberone-v1.yaml is available." />;
  }

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>Swagger UI</h1>
        <p>Interactive API explorer — try endpoints with live authentication.</p>
      </header>
      <SwaggerViewer spec={spec} />
    </div>
  );
}
