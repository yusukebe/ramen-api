import { Hono } from 'hono'

import { getShop, listShops } from '@/app'

export const app = new Hono()

app.get('/', async (c) => {
  return c.json({ message: 'Here is Ramen API' })
})

app.get('/shops', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const perPage = Number(c.req.query('per_page') ?? 10)
  const listResult = await listShops({ page, perPage })
  return c.json({
    total_count: listResult.totalCount,
    shops: listResult.shops,
  })
})

app.get('/shops/:id', async (c) => {
  const id = c.req.param('id')
  const shop = await getShop(id)
  return c.json({ shop: shop })
})

app.fire()
