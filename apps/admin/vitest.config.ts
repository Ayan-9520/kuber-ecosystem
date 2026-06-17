import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kuberone/shared-theme': path.resolve(__dirname, '../../packages/shared-theme/src/index.ts'),
      '@kuberone/security-testing': path.resolve(
        __dirname,
        '../../packages/security-testing/dist/index.js',
      ),
      '@kuberone/performance-testing': path.resolve(
        __dirname,
        '../../packages/performance-testing/dist/index.js',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/mocks/**'],
    },
  },
});
