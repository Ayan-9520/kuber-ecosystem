/** @type {import('jest').Config} */
const sharedMappers = {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@kuberone/mobile-testing$': '<rootDir>/../../packages/mobile-testing/dist/index.js',
  '^@kuberone/security-testing$': '<rootDir>/../../packages/security-testing/dist/index.js',
  '^@kuberone/performance-testing$': '<rootDir>/../../packages/performance-testing/dist/index.js',
};

const sharedTransform = {
  '^.+\\.tsx?$': [
    'babel-jest',
    { presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] },
  ],
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'logic',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.ts',
        '<rootDir>/tests/integration/**/*.test.ts',
        '<rootDir>/tests/store/**/*.test.ts',
        '<rootDir>/tests/services/**/*.test.ts',
        '<rootDir>/tests/navigation/**/*.test.ts',
        '<rootDir>/tests/performance/**/*.test.ts',
        '<rootDir>/tests/accessibility/**/*.test.ts',
        '<rootDir>/tests/security/**/*.test.ts',
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-logic.ts'],
      moduleNameMapper: {
        ...sharedMappers,
        '^react-native$': '<rootDir>/tests/mocks/react-native.tsx',
      },
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { presets: ['@babel/preset-typescript'] }],
      },
    },
    {
      displayName: 'ui',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/components/**/*.test.tsx', '<rootDir>/tests/screens/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      moduleNameMapper: {
        ...sharedMappers,
        '^react-native$': '<rootDir>/tests/mocks/react-native.tsx',
      },
      transform: sharedTransform,
    },
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
};
