import yaml from 'js-yaml';

import { resolveModuleId } from './categories';
import type { HttpMethod, OpenApiDocument, OpenApiEndpoint, OpenApiParameter } from './types';

const METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

function slugify(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

function extractExample(content: unknown): unknown {
  if (!content || typeof content !== 'object') return undefined;
  const c = content as Record<string, unknown>;
  const appJson = c['application/json'] as Record<string, unknown> | undefined;
  return appJson?.example;
}

function extractParameters(op: Record<string, unknown>): OpenApiParameter[] {
  const params = op.parameters;
  if (!Array.isArray(params)) return [];
  return params.map((p) => {
    const row = p as Record<string, unknown>;
    return {
      name: String(row.name ?? ''),
      in: (row.in as OpenApiParameter['in']) ?? 'query',
      required: Boolean(row.required),
      description: row.description != null ? String(row.description) : undefined,
      schema: row.schema as Record<string, unknown> | undefined,
    };
  });
}

export function parseOpenApiYaml(source: string): OpenApiDocument {
  return yaml.load(source) as OpenApiDocument;
}

export function buildEndpointIndex(doc: OpenApiDocument): OpenApiEndpoint[] {
  const endpoints: OpenApiEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const method of METHODS) {
      const op = (pathItem as Record<string, unknown>)[method];
      if (!op || typeof op !== 'object') continue;

      const operation = op as Record<string, unknown>;
      const tags = Array.isArray(operation.tags) ? operation.tags.map(String) : [];
      const permissions = Array.isArray(operation['x-permissions'])
        ? operation['x-permissions'].map(String)
        : [];
      const security = operation.security !== undefined
        ? Array.isArray(operation.security) && operation.security.length > 0
        : true;

      const requestBody = operation.requestBody as Record<string, unknown> | undefined;
      const requestContent = requestBody?.content as Record<string, unknown> | undefined;

      const responses = (operation.responses ?? {}) as Record<string, unknown>;
      let responseExample: unknown;
      for (const code of ['200', '201']) {
        const resp = responses[code];
        if (resp && typeof resp === 'object') {
          const ex = extractExample((resp as Record<string, unknown>).content);
          if (ex !== undefined) {
            responseExample = ex;
            break;
          }
        }
      }

      const operationId = operation.operationId != null ? String(operation.operationId) : undefined;
      const id = operationId ?? `${method}_${slugify(path)}`;

      endpoints.push({
        id,
        method,
        path,
        operationId,
        summary: operation.summary != null ? String(operation.summary) : undefined,
        description: operation.description != null ? String(operation.description) : undefined,
        tags,
        moduleId: resolveModuleId(path, tags),
        permissions,
        dataScope: operation['x-data-scope'] != null ? String(operation['x-data-scope']) : undefined,
        security,
        parameters: extractParameters(operation),
        requestBody: requestBody as Record<string, unknown> | undefined,
        responses,
        requestExample: extractExample(requestContent),
        responseExample,
      });
    }
  }

  return endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
}

export function groupEndpointsByModule(endpoints: OpenApiEndpoint[]): Map<string, OpenApiEndpoint[]> {
  const map = new Map<string, OpenApiEndpoint[]>();
  for (const ep of endpoints) {
    const list = map.get(ep.moduleId) ?? [];
    list.push(ep);
    map.set(ep.moduleId, list);
  }
  return map;
}

export function findEndpoint(
  endpoints: OpenApiEndpoint[],
  method: string,
  path: string,
): OpenApiEndpoint | undefined {
  const m = method.toLowerCase() as HttpMethod;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return endpoints.find((ep) => ep.method === m && ep.path === normalized);
}
