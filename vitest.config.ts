import * as path from 'node:path'
import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

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
})
