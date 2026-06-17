import type { Config } from 'jest';

const config: Config = {
  displayName: 'integration',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  globalSetup: '<rootDir>/tests/integration/global-setup.mjs',
  globalTeardown: '<rootDir>/tests/integration/global-teardown.mjs',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.integration.ts'],
  moduleNameMapper: {
    '^@kuberone/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
    '^openai$': '<rootDir>/tests/integration/mocks/openai.mock.ts',
    '(.*)/s3-storage\\.service(\\.js)?$': '<rootDir>/tests/integration/mocks/storage.mock.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
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
  testMatch: ['**/*.flow.test.ts', '**/*.integration.test.ts'],
  testTimeout: 120_000,
  verbose: true,
  injectGlobals: true,
  maxWorkers: 1,
  forceExit: true,
  coverageDirectory: 'coverage-integration',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    'src/modules/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/routes/**',
  ],
};

export default config;
