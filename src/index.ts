import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { cors } from 'hono/cors'
import { graphqlServer } from 'hono/graphql-server'
import { prettyJSON } from 'hono/pretty-json'
import { getMimeType } from 'hono/utils/mime'
import { getContentFromKVAsset } from 'hono/utils/cloudflare'
import { getShop, listShops, getAuthor, listShopsWithPager } from '@/app'
import { schema } from '@/graphql'

export const app = new Hono()

app.use('*', poweredBy())
app.use('*', prettyJSON())
app.use('*', cors())

app.get('/', async (c) => {
  return c.json({ message: 'Here is Ramen API' })
})

app.get('/shops', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const per_page = Number(c.req.query('per_page') ?? 10)
  const listResult = await listShopsWithPager({ page, per_page })
  return c.json(listResult)
})

app.get('/shops/:id', async (c) => {
  const id = c.req.param('id')
  const shop = await getShop(id)
  if (!shop) {
    return c.json(
      {
        errors: [
          {
            message: `The requested Ramen Shop '${id}' is not found`,
          },
        ],
      },
      404
    )
  }
  return c.json({ shop: shop })
})

app.get('/authors/:id', async (c) => {
  const id = c.req.param('id')
  const author = await getAuthor(id)
  if (!author) {
    return c.json(
      {
        errors: [
          {
            message: `The requested Author '${id}' is not found`,
          },
        ],
      },
      404
    )
  }
  return c.json({ author: author })
})

app.get('/images/:shopId/:filename', async (c) => {
  const shopId = c.req.param('shopId')
  const filename = c.req.param('filename')
  const mimeType = getMimeType(filename)
  const content = await getContentFromKVAsset(`shops/${shopId}/${filename}`)

  if (!content) return c.notFound()

  c.header('Content-Type', mimeType)
  return c.body(content)
})

app.notFound((c) => {
  return c.json(
    {
      errors: [
        {
          message: 'Not found',
        },
      ],
    },
    404
  )
})

app.use('/graphql', graphqlServer({ schema }))

app.fire()
