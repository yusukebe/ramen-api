import * as path from 'node:path'
import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './wrangler.jsonc',
      },
    }),
  ],
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
    include: ['./validation/**/*.test.ts'],
  },
})
