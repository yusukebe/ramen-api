import { getJSONFromKVAsset } from '@/kv'

// Mock
const store: { [key: string]: object } = {
  'hello.abcdef.json': { message: 'hello' },
}
const manifest = JSON.stringify({
  'hello.json': 'hello.abcdef.json',
})

Object.assign(global, { __STATIC_CONTENT_MANIFEST: manifest })
Object.assign(global, {
  __STATIC_CONTENT: {
    get: (path: string) => {
      return store[path]
    },
  },
})

describe('getJSONFromKVAsset', () => {
  it('Should return JSON object', async () => {
    const data = await getJSONFromKVAsset<{ [key: string]: string }>('hello.json')
    expect(data).not.toBeFalsy()
    expect(data['message']).toBe('hello')
  })
})
