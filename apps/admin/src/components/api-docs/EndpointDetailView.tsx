import { Shield } from 'lucide-react';

import { CodeBlock } from './CodeBlock';
import { MethodBadge } from './MethodBadge';

import type { OpenApiEndpoint, OpenApiDocument } from '@/lib/openapi';
import { getModuleById } from '@/lib/openapi';


interface EndpointDetailViewProps {
  endpoint: OpenApiEndpoint;
  spec?: OpenApiDocument;
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function resolveSchemaRef(spec: OpenApiDocument | undefined, ref: string): unknown {
  if (!spec?.components || !ref.startsWith('#/')) return ref;
  const parts = ref.slice(2).split('/');
  let cur: unknown = spec.components;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return ref;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function EndpointDetailView({ endpoint, spec }: EndpointDetailViewProps) {
  const mod = getModuleById(endpoint.moduleId);
  const pathParams = endpoint.parameters.filter((p) => p.in === 'path');
  const queryParams = endpoint.parameters.filter((p) => p.in === 'query');
  const responseCodes = Object.keys(endpoint.responses).sort();

  const requestSchema = endpoint.requestBody
    ? (endpoint.requestBody as Record<string, unknown>).content
    : undefined;

  return (
    <div className="api-endpoint-detail">
      <div className="api-endpoint-header">
        <MethodBadge method={endpoint.method} />
        <code className="api-endpoint-path">{endpoint.path}</code>
      </div>

      <div className="api-endpoint-meta">
        <span className="api-meta-chip">{mod?.name ?? endpoint.moduleId}</span>
        {endpoint.security ? (
          <span className="api-meta-chip api-meta-secure">
            <Shield size={12} /> Auth required
          </span>
        ) : (
          <span className="api-meta-chip">Public</span>
        )}
        {endpoint.dataScope ? (
          <span className="api-meta-chip">Scope: {endpoint.dataScope}</span>
        ) : null}
      </div>

      {endpoint.summary ? <p className="api-endpoint-summary">{endpoint.summary}</p> : null}
      {endpoint.description ? <p className="api-endpoint-desc">{endpoint.description}</p> : null}

      {endpoint.permissions.length > 0 ? (
        <section className="api-endpoint-section">
          <h3>Permissions</h3>
          <div className="api-perm-list">
            {endpoint.permissions.map((p) => (
              <code key={p} className="api-perm-chip">{p}</code>
            ))}
          </div>
        </section>
      ) : null}

      {pathParams.length > 0 ? (
        <section className="api-endpoint-section">
          <h3>Path Parameters</h3>
          <table className="data-table api-param-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {pathParams.map((p) => (
                <tr key={p.name}>
                  <td><code>{p.name}</code></td>
                  <td>{p.required ? 'Yes' : 'No'}</td>
                  <td>{p.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {queryParams.length > 0 ? (
        <section className="api-endpoint-section">
          <h3>Query Parameters</h3>
          <table className="data-table api-param-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {queryParams.map((p) => (
                <tr key={p.name}>
                  <td><code>{p.name}</code></td>
                  <td>{p.required ? 'Yes' : 'No'}</td>
                  <td>{p.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {requestSchema ? (
        <section className="api-endpoint-section">
          <h3>Request Body</h3>
          <CodeBlock
            code={formatJson(endpoint.requestExample ?? requestSchema)}
            language="json"
            title="application/json"
          />
        </section>
      ) : null}

      <section className="api-endpoint-section">
        <h3>Responses</h3>
        <div className="api-response-list">
          {responseCodes.map((code) => {
            const resp = endpoint.responses[code] as Record<string, unknown> | undefined;
            const ref = resp?.$ref as string | undefined;
            const resolved = ref ? resolveSchemaRef(spec, ref) : resp;
            return (
              <div key={code} className="api-response-item">
                <span className={`api-status-code api-status-${code.charAt(0)}`}>{code}</span>
                <span>{typeof resolved === 'object' && resolved && 'description' in resolved
                  ? String((resolved as Record<string, unknown>).description)
                  : ref ?? 'Response'}</span>
              </div>
            );
          })}
        </div>
        {endpoint.responseExample ? (
          <CodeBlock code={formatJson(endpoint.responseExample)} language="json" title="Example" />
        ) : null}
      </section>

      <section className="api-endpoint-section">
        <h3>cURL Example</h3>
        <CodeBlock
          language="bash"
          title="cURL"
          code={`curl -X ${endpoint.method.toUpperCase()} \\
  '${endpoint.path.startsWith('http') ? endpoint.path : `http://localhost:4000/api/v1${endpoint.path}`}' \\
  -H 'Authorization: Bearer <accessToken>' \\
  -H 'Content-Type: application/json'`}
        />
      </section>
    </div>
  );
}
