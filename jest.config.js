export default {
  testMatch: ['**/test/**/*.+(ts|tsx)', '**/validation/**/*.+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx|js)$': 'esbuild-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!fetch-to-node|@modelcontextprotocol).+\\.js$',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    sitePath: './mock',
    module: true,
  },
}
