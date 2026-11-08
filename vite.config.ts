import * as path from 'node:path'
import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './wrangler.jsonc',
      },
      miniflare: {
        compatibilityDate: '2025-04-01',
        compatibilityFlags: ['nodejs_compat'],
      },
    }),
  ],
  test: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
    },
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: ['ajv', 'graphql', '@hono/graphql-server', 'statuses'],
        },
      },
    },
    include: ['./test/**/*.test.ts'],
  },
  fmt: {
    printWidth: 80,
    trailingComma: 'es5',
    tabWidth: 2,
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true,
    endOfLine: 'lf',
    ignorePatterns: ['content/**', 'worker-configuration.d.ts'],
  },
  lint: {
    ignorePatterns: ['worker-configuration.d.ts'],
    rules: { 'typescript/no-useless-default-assignment': 'off' },
    options: { typeAware: true, typeCheck: true },
  },
})
