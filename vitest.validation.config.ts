import * as path from 'node:path'
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    globals: true,
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: [
            'ajv',
            'graphql',
            '@hono/graphql-server',
            'fetch-to-node',
            'statuses',
          ],
        },
      },
    },
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.jsonc',
        },
      },
    },
    include: ['./validation/**/*.test.ts'],
  },
})
