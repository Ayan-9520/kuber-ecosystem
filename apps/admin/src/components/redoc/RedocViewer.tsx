import { lazy, Suspense, useMemo } from 'react';

import { LoadingSpinner } from '@/components/ui';
import type { OpenApiDocument } from '@/lib/openapi';

const RedocStandalone = lazy(() =>
  import('@/vendor/redoc-lazy').then((m) => ({ default: m.RedocStandalone })),
);

interface RedocViewerProps {
  spec: OpenApiDocument | Record<string, unknown>;
}

export function RedocViewer({ spec }: RedocViewerProps) {
  const specObject = useMemo(() => spec as object, [spec]);

  return (
    <div className="redoc-viewer">
      <Suspense fallback={<LoadingSpinner />}>
        <RedocStandalone
          spec={specObject}
          options={{
            scrollYOffset: 80,
            hideDownloadButton: false,
            disableSearch: false,
            expandResponses: '200,201',
            jsonSampleExpandLevel: 2,
            theme: {
              colors: {
                primary: { main: '#22d3a6' },
                text: { primary: 'var(--color-text)', secondary: 'var(--color-text-secondary)' },
                http: {
                  get: '#38bdf8',
                  post: '#18c964',
                  put: '#f59e0b',
                  delete: '#ef4444',
                },
              },
              typography: {
                fontFamily: 'inherit',
                headings: { fontFamily: 'inherit' },
              },
              sidebar: {
                backgroundColor: 'var(--color-card)',
                textColor: 'var(--color-text-secondary)',
              },
              rightPanel: {
                backgroundColor: 'var(--color-surface)',
              },
            },
          }}
        />
      </Suspense>
    </div>
  );
}
