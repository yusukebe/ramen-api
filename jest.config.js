module.exports = {
  testMatch: ['**/test/**/*.+(ts|tsx)', '**/validation/**/*.+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'esbuild-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    sitePath: './mock',
  },
}
