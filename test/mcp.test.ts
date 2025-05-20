import { app } from '@/index'

describe('Test /mcp', () => {
  it('Should return initialize response', async () => {
    const res = await app.request('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          clientInfo: {
            name: 'test-client',
            version: '0.0.0',
          },
          capabilities: { tools: true },
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
    })

    const messages = await parseSSEJSONResponse(res)
    const result = messages.find((m) => m.id === 1)

    expect(result.result.serverInfo.name).toBe('Ramen API MCP Server')
    expect(res.status).toBe(200)
  })

  it('Should return a list of tools with correct properties', async () => {
    const res = await app.request('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
    })

    const messages = await parseSSEJSONResponse(res)
    const result = messages.find((m) => m.id === 2)

    expect(res.status).toBe(200)
    expect(result).toHaveProperty('result')
    expect(Array.isArray(result.result.tools)).toBe(true)
    expect(result.result.tools.length).toBeGreaterThan(0)

    const getShopsTool = result.result.tools.find(
      (tool) => tool.name === 'get_shops'
    )
    expect(getShopsTool).toBeDefined()
    expect(getShopsTool).toHaveProperty('description', 'Get ramen shops')
    expect(getShopsTool).toHaveProperty('inputSchema')
    expect(getShopsTool.inputSchema).toHaveProperty('type', 'object')
    expect(getShopsTool.inputSchema.properties).toHaveProperty('perPage')
    expect(getShopsTool.inputSchema.properties.perPage).toHaveProperty(
      'type',
      'number'
    )
    expect(getShopsTool.inputSchema.properties.perPage).toHaveProperty(
      'minimum',
      1
    )
    expect(getShopsTool.inputSchema.properties).toHaveProperty('page')
    expect(getShopsTool.inputSchema.properties.page).toHaveProperty(
      'type',
      'number'
    )
    expect(getShopsTool.inputSchema.properties.page).toHaveProperty(
      'minimum',
      1
    )

    const getShopTool = result.result.tools.find(
      (tool) => tool.name === 'get_shop'
    )
    expect(getShopTool).toBeDefined()
    expect(getShopTool).toHaveProperty('description', 'Get a shop information')
    expect(getShopTool).toHaveProperty('inputSchema')
    expect(getShopTool.inputSchema).toHaveProperty('type', 'object')
    expect(getShopTool.inputSchema.properties).toHaveProperty('shopId')
    expect(getShopTool.inputSchema.properties.shopId).toHaveProperty(
      'type',
      'string'
    )
  })

  it('Should execute get_shops tool and return a list of shops', async () => {
    const res = await app.request('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_shops',
          arguments: {
            perPage: 5,
            page: 1,
          },
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
    })

    const messages = await parseSSEJSONResponse(res)
    const result = messages.find((m) => m.id === 3)

    expect(res.status).toBe(200)
    expect(result).toHaveProperty('result')
    expect(result.result).toHaveProperty('content')
    expect(Array.isArray(result.result.content)).toBe(true)

    const content = result.result.content[0]
    expect(content).toHaveProperty('type', 'text')
    expect(content).toHaveProperty('text')

    const shops = JSON.parse(content.text)
    expect(shops).toHaveProperty('shops')
    expect(Array.isArray(shops.shops)).toBe(true)
    expect(shops.shops.length).toBeGreaterThan(0)
  })

  it('Should execute get_shop tool and return shop details', async () => {
    const res = await app.request('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_shop',
          arguments: {
            shopId: 'yoshimuraya',
          },
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
    })

    const messages = await parseSSEJSONResponse(res)
    const result = messages.find((m) => m.id === 4)

    expect(res.status).toBe(200)

    expect(result).toHaveProperty('result')
    expect(result.result).toHaveProperty('content')
    expect(Array.isArray(result.result.content)).toBe(true)

    const content = result.result.content[0]
    expect(content).toHaveProperty('type', 'text')
    expect(content).toHaveProperty('text')

    const shop = JSON.parse(content.text)
    expect(shop).toHaveProperty('id', 'yoshimuraya')
    expect(shop).toHaveProperty('name') // 店名が存在することを確認
    expect(shop).toHaveProperty('photos') // 写真データが存在することを確認
    expect(Array.isArray(shop.photos)).toBe(true)
  })
})

export async function parseSSEJSONResponse(res: Response) {
  const text = await res.text()
  const lines = text.split('\n')
  const dataLines = lines.filter((line) => line.startsWith('data: '))
  const jsonStrings = dataLines.map((line) => line.slice(6))
  return jsonStrings.map((json) => JSON.parse(json))
}
