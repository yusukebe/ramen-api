import { StreamableHTTPTransport } from '@hono/mcp'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from './app'
import { getShop, getShopPhotosWithData, listShopsWithPager } from './app'

export const getMcpServer = async (c: Context<Env>) => {
  const server = new McpServer({
    name: 'Ramen API MCP Server',
    version: '0.0.1',
  })
  server.tool(
    'get_shops',
    'Get ramen shops',
    {
      perPage: z.number().min(1),
      page: z.number().min(1),
    },
    async ({ perPage, page }) => {
      const result = await listShopsWithPager({ perPage, page }, { c })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      }
    }
  )
  server.tool(
    'get_shop',
    'Get a shop information',
    {
      shopId: z.string(),
    },
    async ({ shopId }) => {
      const shop = await getShop(shopId, { c })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(shop),
          },
        ],
      }
    }
  )
  server.tool(
    'get_photos_with_data',
    'Get ramen photos with base64 data',
    { shopId: z.string() },
    async ({ shopId }) => {
      const photos = await getShopPhotosWithData(shopId, { c })
      return {
        content: photos.map((photo) => ({
          type: 'image',
          data: photo.base64,
          mimeType: 'image/jpeg',
        })),
      }
    }
  )
  return server
}

const app = new Hono<Env>()

app.all('/', async (c) => {
  const mcpServer = await getMcpServer(c)
  const transport = new StreamableHTTPTransport()
  await mcpServer.connect(transport)
  return transport.handleRequest(c)
})

export default app
