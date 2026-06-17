import type { Config } from 'jest';

const config: Config = {
  displayName: 'unit',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@kuberone/database$': '<rootDir>/tests/mocks/database.mock.ts',
    '^@kuberone/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
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
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/load-env.ts',
    '!src/**/*.module.ts',
    '!src/**/routes/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 8,
      statements: 8,
    },
  },
  testTimeout: 30_000,
  verbose: true,
  injectGlobals: true,
};

export default config;
