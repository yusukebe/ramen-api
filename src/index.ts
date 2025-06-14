import { graphqlServer } from '@hono/graphql-server'
import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { cors } from 'hono/cors'
import { showRoutes } from 'hono/dev'
import { poweredBy } from 'hono/powered-by'
import { prettyJSON } from 'hono/pretty-json'
import mcpApp from './mcp'
import { getShop, getAuthor, listShopsWithPager, getShopImage } from '@/app'
import { createErrorMessage } from '@/error'
import { getSchema } from '@/graphql'

export const app = new Hono<{
  Variables: {
    BASE_URL: string
  }
  Bindings: {
    ASSETS?: Fetcher
  }
}>()

app.use('*', poweredBy())
app.use('*', prettyJSON())
app.use('*', cors())

app.get('/content/*', (c) => c.notFound())

app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  const baseURL = `${url.protocol}//${url.hostname}/`
  c.set('BASE_URL', baseURL)
  await next()
})

app.get('/', async (c) => {
  return c.json({
    message: 'Here is Ramen API. <https://github.com/yusukebe/ramen-api>',
  })
})

app.get('/shops', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const perPage = Number(c.req.query('perPage') ?? 10)
  const listResult = await listShopsWithPager(
    { page, perPage },
    {
      c,
    }
  )
  return c.json(listResult)
})

app.get('/shops/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const shop = await getShop(id, { c })
    if (!shop) {
      return c.json(
        createErrorMessage(`The requested Ramen Shop '${id}' is not found`),
        404
      )
    }
    return c.json({ shop: shop })
  } catch (e) {
    return c.json(
      createErrorMessage(`The requested Ramen Shop '${id}' is not found`),
      404
    )
  }
})

app.get('/authors/:id', async (c) => {
  const id = c.req.param('id')
  const author = await getAuthor(id, { c })
  if (!author) {
    return c.json(
      createErrorMessage(`The requested Author '${id}' is not found`),
      404
    )
  }
  return c.json({ author: author })
})

app.get(
  '/images/:shopId/:filename',
  async (c, next) => {
    if (globalThis.process && process.env.NODE_ENV === 'test') {
      await next()
    } else {
      return cache({
        cacheName: 'ramen-api-image-cache',
      })(c, next)
    }
  },
  async (c) => {
    const shopId = c.req.param('shopId')
    const filename = c.req.param('filename')
    const response = await getShopImage(
      shopId,
      filename,
      c.env.ASSETS,
      c.req.url
    )
    return response
  }
)

app.notFound((c) => {
  return c.json(createErrorMessage('Not Found'), 404)
})

app.onError((e, c) => {
  console.log(`${e}`)
  return c.json(createErrorMessage('Internal Server Error'), 500)
})

app.use('/graphql', (c, next) => {
  return graphqlServer({
    schema: getSchema({
      c,
    }),
  })(c, next)
})

app.route('/mcp', mcpApp)

export default app
