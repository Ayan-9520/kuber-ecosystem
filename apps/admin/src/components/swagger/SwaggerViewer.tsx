import { lazy, Suspense, useMemo } from 'react';

import { LoadingSpinner } from '@/components/ui';
import type { OpenApiDocument } from '@/lib/openapi';

const SwaggerUI = lazy(() => import('@/vendor/swagger-ui-lazy'));

interface SwaggerViewerProps {
  spec: OpenApiDocument | Record<string, unknown>;
  docExpansion?: 'list' | 'full' | 'none';
  defaultModelsExpandDepth?: number;
}

export function SwaggerViewer({
  spec,
  docExpansion = 'list',
  defaultModelsExpandDepth = 1,
}: SwaggerViewerProps) {
  const specObject = useMemo(() => spec as object, [spec]);

  return (
    <div className="swagger-viewer">
      <Suspense fallback={<LoadingSpinner />}>
        <SwaggerUI
          spec={specObject}
          docExpansion={docExpansion}
          defaultModelsExpandDepth={defaultModelsExpandDepth}
          persistAuthorization
          tryItOutEnabled
          filter
          deepLinking
        />
      </Suspense>
    </div>
  );
}
