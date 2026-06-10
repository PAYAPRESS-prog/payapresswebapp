/** Smoke-test config — jsdom env for React component mount tests.
 *  Run with: npx jest --config jest.smoke.config.js
 *  Kept separate from jest.config.js (node env, lib unit tests).
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@solar-icons/react-perf(/.*)?$': '<rootDir>/smoke/__mocks__/solarIcons.js',
    '^next/navigation$': '<rootDir>/smoke/__mocks__/nextNavigation.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/smoke/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', esModuleInterop: true },
    }],
  },
};
