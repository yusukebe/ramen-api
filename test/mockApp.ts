import { Hono } from 'hono'

const app = new Hono().basePath('/content')

app.get('/shops.json', (c) => {
  return c.json({
    shopIds: ['yoshimuraya', 'sugitaya', 'takasagoya'],
  })
})

app.get('/shops/yoshimuraya/info.json', (c) => {
  return c.json({
    id: 'yoshimuraya',
    name: '吉村家',
    photos: [
      {
        name: 'yoshimuraya-001.jpg',
        width: 1200,
        height: 900,
        authorId: 'yusukebe',
      },
    ],
  })
})

app.get('/shops/sugitaya/info.json', (c) => {
  return c.json({
    id: 'sugitaya',
    name: '杉田家',
    photos: [
      {
        name: 'sugitaya-001.jpg',
        width: 1200,
        height: 900,
        authorId: 'yusukebe',
      },
    ],
  })
})

app.get('/shops/takasagoya/info.json', (c) => {
  return c.json({
    id: 'takasagoya',
    name: 'たかさご家',
    photos: [
      {
        name: 'takasagoya-001.jpg',
        width: 1200,
        height: 900,
        authorId: 'yusukebe',
      },
    ],
  })
})

app.get('/authors/yusukebe/info.json', (c) => {
  return c.json({
    id: 'yusukebe',
    name: 'Yusuke Wada',
    url: 'https://github.com/yusukebe',
  })
})

app.get('/:filename{.+\\.jpg}', () => {
  return new Response(new ArrayBuffer(1024), {
    status: 200,
    headers: { 'Content-Type': 'image/jpeg' },
  })
})

export default app
