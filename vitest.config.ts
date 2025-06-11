import * as path from 'node:path'
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
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
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: {
          configPath: './wrangler.jsonc',
        },
        miniflare: {
          compatibilityDate: '2025-04-01',
          compatibilityFlags: ['nodejs_compat'],
          isolatedStorage: false,
        },
      },
    },
    include: ['./test/**/*.test.ts'],
  },
})
