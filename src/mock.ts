const mockStore: { [key: string]: object } = {
  'shops.abc.json': { shopIds: ['yoshimuraya', 'sugitaya', 'takasagoya'] },
  'yoshimuraya.abc.json': {
    id: 'yoshimuraya',
    name: '吉村家',
    photos: [
      {
        name: 'yoshimuraya-001.jpg',
      },
    ],
  },
  'sugitaya.abc.json': {
    id: 'sugitaya',
    name: '杉田家',
  },
  'takasagoya.abc.json': {
    id: 'takasagoya',
    name: 'たかさご家',
  },
}

const mockManifest = JSON.stringify({
  'shops.json': 'shops.abc.json',
  'shops/yoshimuraya/info.json': 'yoshimuraya.abc.json',
  'shops/sugitaya/info.json': 'sugitaya.abc.json',
  'shops/takasagoya/info.json': 'takasagoya.abc.json',
})

export const assign = () => {
  Object.assign(global, { __STATIC_CONTENT_MANIFEST: mockManifest })
  Object.assign(global, {
    __STATIC_CONTENT: {
      get: (path: string) => {
        return mockStore[path]
      },
    },
  })
}
