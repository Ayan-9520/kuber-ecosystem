import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CodeBlock } from '@/components/api-docs';
import { LoadingSpinner } from '@/components/ui';
import { trackDocEvent } from '@/lib/openapi/analytics';

export function OpenApiViewerPage() {
  const [yaml, setYaml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/openapi/kuberone-v1.yaml')
      .then((r) => r.text())
      .then((text) => {
        setYaml(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    trackDocEvent('download', 'openapi-yaml', 'OpenAPI YAML');
  };

  if (loading) return <LoadingSpinner />;

  const preview = yaml ? yaml.split('\n').slice(0, 80).join('\n') + '\n\n# … truncated — download full spec' : '';

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>OpenAPI 3.1 Specification</h1>
        <p>
          Official API contract at <code>openapi/kuberone-v1.yaml</code>. Compatible with Swagger UI, Redoc, and code generators.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <a href="/openapi/kuberone-v1.yaml" download onClick={handleDownload} className="btn btn-primary">
            <Download size={16} /> Download YAML
          </a>
          <a href="/openapi/kuberone-v1.yaml" target="_blank" rel="noreferrer" className="btn btn-secondary">
            <ExternalLink size={16} /> Open Raw
          </a>
        </div>
      </header>

      {yaml ? (
        <>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            {yaml.split('\n').length.toLocaleString()} lines · OpenAPI 3.1.0
          </p>
          <CodeBlock code={preview} language="yaml" title="Preview" />
        </>
      ) : null}
    </div>
  );
}
