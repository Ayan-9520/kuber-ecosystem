import type { Config } from 'jest';

const config: Config = {
  displayName: 'performance',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/performance'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@kuberone/database$': '<rootDir>/tests/mocks/database.mock.ts',
    '^@kuberone/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
    '^@kuberone/performance-testing$': '<rootDir>/../../packages/performance-testing/dist/index.js',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'bundler',
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/*.performance.test.ts'],
  testTimeout: 60_000,
  verbose: true,
  injectGlobals: true,
};

export default config;
