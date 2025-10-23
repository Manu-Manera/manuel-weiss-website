module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/unit/**/*.ts',
    '**/integration/**/*.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        strict: false,
        noImplicitAny: false,
        strictNullChecks: false,
        esModuleInterop: true,
        skipLibCheck: true,
        noImplicitReturns: false,
        noFallthroughCasesInSwitch: false,
        noUnusedLocals: false,
        noUnusedParameters: false
      }
    }]
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  testTimeout: 30000,
  verbose: true
};
