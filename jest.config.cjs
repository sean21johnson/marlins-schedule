/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/test/__mocks__/styleMock.cjs',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.(ts|tsx)'],

  // Helpful to see warnings from styled-components, etc.
  verbose: true,
};