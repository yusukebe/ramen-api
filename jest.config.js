module.exports = {
  testMatch: ['**/test/**/*.+(ts|tsx)', '**/validation/**/*.+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'esbuild-jest',
  },
  resolver: 'jest-node-exports-resolver',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'miniflare',
}
