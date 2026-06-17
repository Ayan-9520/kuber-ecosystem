import { defineConfig } from 'vitest/config';

/**
 * Root Vitest config for shared packages orchestration.
 * App-specific configs live in apps/admin and packages/*.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'apps/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary'],
    },
  },
});
