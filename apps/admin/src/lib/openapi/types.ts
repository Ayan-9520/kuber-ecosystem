export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
}

export interface OpenApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  moduleId: string;
  permissions: string[];
  dataScope?: string;
  security: boolean;
  parameters: OpenApiParameter[];
  requestBody?: Record<string, unknown>;
  responses: Record<string, unknown>;
  requestExample?: unknown;
  responseExample?: unknown;
}

export interface ApiModule {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string;
}

export interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: { name?: string; email?: string };
  };
  servers: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  paths: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
    responses?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
}

export interface SearchResult {
  type: 'endpoint' | 'module' | 'guide' | 'error';
  id: string;
  title: string;
  subtitle?: string;
  path: string;
  score: number;
}

export interface DocAnalyticsEvent {
  type: 'page_view' | 'endpoint_view' | 'search' | 'download';
  key: string;
  label?: string;
  timestamp: number;
}
