const objectToBuffer = (data: object) => {
  const string = JSON.stringify(data)
  return new TextEncoder().encode(string)
}

const store: Record<string, ArrayBuffer> = {
  'shops/yoshimuraya/info.abc.json': objectToBuffer({
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
  }),
  'shops/sugitaya/info.abc.json': objectToBuffer({
    id: 'sugitaya',
    name: '杉田家',
  }),
  'shops/takasagoya/info.abc.json': objectToBuffer({
    id: 'takasagoya',
    name: 'たかさご家',
  }),
  'shops.abc.json': objectToBuffer({
    shopIds: ['yoshimuraya', 'sugitaya', 'takasagoya'],
  }),
  'shops/yoshimuraya/yoshimuraya-001.abc.jpg': objectToBuffer({}), // <-- Blank object for mocking,
  'authors/yusukebe/info.abc.json': objectToBuffer({
    id: 'yusukebe',
    name: 'Yusuke Wada',
    url: 'https://github.com/yusukebe',
  }),
}
const manifest = JSON.stringify({
  'shops/yoshimuraya/yoshimuraya-001.jpg': 'shops/yoshimuraya/yoshimuraya-001.abc.jpg',
  'shops/yoshimuraya/info.json': 'shops/yoshimuraya/info.abc.json',
  'shops/sugitaya/info.json': 'shops/sugitaya/info.abc.json',
  'shops/takasagoya/info.json': 'shops/takasagoya/info.abc.json',
  'shops.json': 'shops.abc.json',
  'authors/yusukebe/info.json': 'authors/yusukebe/info.abc.json',
})

export const assign = () => {
  Object.assign(global, { __STATIC_CONTENT_MANIFEST: manifest })
  Object.assign(global, {
    __STATIC_CONTENT: {
      get: (path: string) => {
        return store[path]
      },
    },
  })
}
