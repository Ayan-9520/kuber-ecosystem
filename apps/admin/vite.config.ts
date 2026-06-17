import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const repoRoot = path.resolve(__dirname, '../..');

/** Heavy API-doc viewers — must not be downleveled by esbuild pre-bundle (Node 20 / Vite 6). */
const API_DOC_VENDOR_DEPS = ['swagger-ui-react', 'redoc'] as const;

function copyApiAssets(): Plugin {
  const copy = () => {
    const publicDir = path.resolve(__dirname, 'public');
    fs.mkdirSync(path.join(publicDir, 'openapi'), { recursive: true });
    fs.mkdirSync(path.join(publicDir, 'postman'), { recursive: true });
    fs.copyFileSync(
      path.join(repoRoot, 'openapi/kuberone-v1.yaml'),
      path.join(publicDir, 'openapi/kuberone-v1.yaml'),
    );
    fs.copyFileSync(
      path.join(repoRoot, 'postman/KuberOne.postman_collection.json'),
      path.join(publicDir, 'postman/KuberOne.postman_collection.json'),
    );
  };

  return {
    name: 'copy-api-assets',
    buildStart: copy,
    configureServer() {
      copy();
    },
  };
}

export default defineConfig({
  plugins: [react(), copyApiAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kuberone/shared-theme': path.resolve(__dirname, '../../packages/shared-theme/src/index.ts'),
    },
  },
  // esbuild 0.28+ cannot downlevel destructuring in redoc/swagger pre-bundles to es2020 targets.
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: [...API_DOC_VENDOR_DEPS],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Modern browsers only — matches tsconfig ES2022; avoids esbuild destructuring transform errors.
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 2500,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/redoc')) return 'vendor-redoc';
          if (
            id.includes('node_modules/swagger-ui-react') ||
            id.includes('node_modules/swagger-client') ||
            id.includes('node_modules/swagger-ui-dist')
          ) {
            return 'vendor-swagger';
          }
        },
      },
    },
  },
});
