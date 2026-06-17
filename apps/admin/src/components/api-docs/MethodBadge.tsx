import type { HttpMethod } from '@/lib/openapi';

const METHOD_COLORS: Record<HttpMethod, string> = {
  get: 'api-method-get',
  post: 'api-method-post',
  put: 'api-method-put',
  patch: 'api-method-patch',
  delete: 'api-method-delete',
};

interface MethodBadgeProps {
  method: HttpMethod | string;
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const m = method.toLowerCase() as HttpMethod;
  return (
    <span className={`api-method-badge ${METHOD_COLORS[m] ?? ''}`}>
      {m.toUpperCase()}
    </span>
  );
}
