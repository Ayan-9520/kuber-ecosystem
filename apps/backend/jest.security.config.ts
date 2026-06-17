import type { Config } from 'jest';

const config: Config = {
  displayName: 'security',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/security'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@kuberone/database$': '<rootDir>/tests/mocks/database.mock.ts',
    '^@kuberone/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
    '^@kuberone/security-testing$': '<rootDir>/../../packages/security-testing/dist/index.js',
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
  testMatch: ['**/*.security.test.ts'],
  testTimeout: 30_000,
  verbose: true,
  injectGlobals: true,
};

export default config;
