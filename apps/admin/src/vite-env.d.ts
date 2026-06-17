/// <reference types="vite/client" />

declare module 'swagger-ui-react' {
  import type { ComponentType } from 'react';

  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    persistAuthorization?: boolean;
    tryItOutEnabled?: boolean;
    filter?: boolean | string;
    deepLinking?: boolean;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
